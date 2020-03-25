FROM ubuntu:latest

RUN sudo apt-get update -y
RUN sudo apt-get install git python clang -y

RUN mkdir /tools
WORKDIR /tools

RUN git clone --depth=1 https://chromium.googlesource.com/chromium/tools/depot_tools.git
ENV PATH="/tools/depot_tools:${PATH}"

RUN git clone https://gn.googlesource.com/gn

WORKDIR /tools/gn
RUN python build/gen.py
RUN ninja -C out
ENV PATH="/tools/gn/out:${PATH}"
