# v2ray-electron

A V2Ray client built with Electron for Windows and macOS

It works as a tray application under Windows or a menu bar application under macOS.
A V2Ray process will be spawned by the app.

## Why use V2Ray

The most exciting feature of V2Ray to me is the ability to define multiple input and ouput methods. The user can define multiple servers and configure freely the way that data flows.

## Design

Since the configuration file of V2Ray is quite complex and flexible, I think it's better to leave the editing of config file to users. Instead of building complex GUIs for configuration, the users can edit the config file using the built-in Monaco editor.

## Features

- Auto start

- Edit configuration file through built-in Monaco editor

- Log viewer

- Set up system proxy

macOS only for now

## Packaging

```bash
yarn dist
```

## TODO

- ~~Auto start~~
- ~~Show log in app~~
- Set up system proxy
- Support PAC file
- Get root priviledge on start