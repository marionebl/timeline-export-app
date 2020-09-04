// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import {startApplication} from './RuntimeInstantiator.js';

startApplication('timeline_export_app');

Runtime.appStarted
  .then(() => poll(() => self.UI.panels.timeline))
  .then(main);

async function poll(fn, { timeout, step } = { timeout: 10000, step: 500 }) {
  const now = performance.now();
  const result = fn();

  if (typeof result === 'undefined') {
    await wait(step);
    return poll(fn, timeout - performance.now() - now);
  }

  return result;
}

function wait(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

function parseTimeWindow(input) {
  const fragments = input.split('::');

  if (fragments.length !== 2) {
    return null;
  }

  const [rawStartFragment, rawEndFragment] = fragments;

  if (!rawStartFragment.startsWith('start:') || !rawEndFragment.startsWith('end')) {
    return null;
  }

  const startFragment = rawStartFragment.replace('start:', '');
  const endFragment = rawEndFragment.replace('end:', '');

  const startTime = parseFloat(startFragment);
  const endTime = parseFloat(endFragment);

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return null;
  }

  return { startTime, endTime };
}

function main(panel) {
  const originalLoadingComplete = panel.loadingComplete.bind(panel);

  panel.loadingComplete = (...args) => {
    const result = originalLoadingComplete(...args);
    const timeWindow = parseTimeWindow(window.location.hash.slice(1));

    if (timeWindow) {
      panel._overviewPane.setWindowTimes(timeWindow.startTime, timeWindow.endTime);
    }

    return result;
  }

  let hashTask;

  panel._overviewPane.addEventListener(
    PerfUI.TimelineOverviewPane.Events.WindowChanged, ({data: {startTime, endTime}}) => {
      if (hashTask) {
        window.cancelIdleCallback(hashTask);
      }

      hashTask = window.requestIdleCallback(() => {
        window.location.hash = ['start:', startTime.toFixed(2), '::', 'end:', endTime.toFixed(2)].join('');
      });
    });
 
  const params = new URLSearchParams(window.location.search);
  panel._loadFromURL(params.get('profile') || './profile.json');
}