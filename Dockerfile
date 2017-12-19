FROM node:6

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

ENV PATH=node_modules/.bin:$PATH

# set correct timezone
RUN ln -fs /usr/share/zoneinfo/Europe/Amsterdam /etc/localtime
RUN dpkg-reconfigure -f noninteractive tzdata

EXPOSE 8000

CMD [ "./run-build.sh" ]
