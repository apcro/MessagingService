# Messaging Service

## Description

A centralised Messaging Service, which provides an internal set of queues to allow existing products to request a message be sent by sending an Event across an Event bus. This outgoing message will be handled by the selected message delivery partners for email, Push Notification and any other external messaging service, and provides an internally-facing UI to provide a way of managing the content & design of outgoing messages.

Input to the Messaging Service is by a pre-determined payload per message event.

The Messaging Service itself is responsible for determining which of the available channels a message is delivered through, and the provided UI allows the managing team to decide on a per-message-type basis which channels are suitable.

### Project organization

The app consists of three apps: an `api` application and two "worker" applications, one for primary `messaging`, one for a `delay` queue, as well as a Web Admin application. 


### Node version

Check the `.nvmrc` file, or run `nvm use`

### Installation

```bash
$ yarn install
```

Copy the contents of `.env.template` to `.env` and update as necessary.

### To Run

```bash
yarn start:dev
```

### Hot Reloading

The root directory is mounted to the container volume so when code is updated the containers restart and rebuild the application code.

### Debugging

The `api`, `messaging` and `delay` apps, when run in development mode expose a debugger. If you are using VSCode you can simply start the debugger and select which app you'd like to attach a debugger to.

> [!NOTE]
> The debug configuration in VSCode is set to attach, not launch.
> You need to run `yarn start:dev` before starting your debugger

### Testing

The application features examples of unit tests and end to end tests. To run:

```bash
# runs unit tests
yarn test
```

```bash
# runs end to end tests
yarn test:e2e:api
# or
yarn test:e2e:messaging
# or
yarn test:e2e:delay
```
