# web-pane
Web-pane is a cross-platform desktop application that allows you to open web pages in "panes" - a kind of always-on-top windows.

It is intended to provide an ability to browse a web page and have it right at your fingertips, while working with other applications. Use cases include a chat window and a web browser, a documentation and a code editor or Wikipedia and a text editor. 

The app uses simple, always-on-top windows (**panes**) to open web pages. You can have multiple panes opened, and each of them can host many web pages. In each pane, only one page is visible at a time and you can switch between them either by keyboard shortcuts, running a command or by clicking on the dock or desktop activators (if you did setup them). Running it by issuing a command allows for flexible integrations, like using a dock or a panel to open the web page.

## Installation
The application uses the Electron framework. Thus, it is available for Linux, Windows and MacOS.
To obtain the application, you can either:
- download the latest release from the [releases page](https://github.com/forsetius/web-pane/releases)
- clone the [repository](https://github.com/forsetius/web-pane) and build the application yourself

For now (v1.1.0), the application is tested only on Linux. Tests on Windows are in progress.

You need Node.js installed to build the application. In the future, the application will be dockerized so developing it will be easier.

### Releases

Each release consists of multiple types of installers and files you can download to get using the application. These are:
- **Linux DEB package** - for Linux distributions like Debian, Ubuntu or Linux Mint. You need root access but once installed, every user can run it like a system command
- **Linux AppImage** - for Linux system, it's an executable you can run standalone, without root access. You'll need to rename it to something practical (like `web-pane`) and copy it to a directory on your `PATH` (like `~/.local/bin`) so that it could be run from any directory
- **Windows NSIS installer** - it's Windows installer package that will install the application on your Windows machine. Administrator rights will be required and the system will probably complain as the app is not certified.
- **Windows Portable** - it's Windows executable that can be run standalone, without proper instalation on your machine. No administration rights necessary, just put it in a directory it can be found and rename it to something practical (like `web-pane`)
- **macOS ZIP** - the only form of distribution I can make for Mac

### Instalation from the repository
To install the application from the repository, you need to:
1. clone the project's repository
2. go to the directory you have the project's files
3. run `web-pane`
4. From now on you can run the application with `web-pane` from any directory

## Invocation
Web-pane can be started in various ways depending on your integrations. Still, in every case it is started by a command.

The simplest (even if not the most convenient) invocation is:
> `web-pane` - opens an empty pane, ready to open your first page

You can also open the pane with a web page loaded:
> `web-pane --url <url>` - opens the web page in the default pane

You can specify the target pane too:
> `web-pane --url <url> --target <pane>` - opens the webapp in the target pane

Internally, the application uses an ID for each webapp. By default, the ID is simply the domain portion of its URL. So, if we use `--url https://www.facebook.com/messages/t/123456789` option, the ID would be `www.facebook.com`. That means that if you have two webapps with the same domain, like: 
- `https://www.facebook.com` for Facebook
- `https://www.facebook.com/messages/t/123456789` for Facebook Messenger
  they will be treated as the same webapp and overwrite one another. To overcome this, you can add an `--id` argument:
> `web-pane --url <url> --id <id>` - opens the webapp with given ID

So, the full invocation is:
> `web-pane --url <url> --id <id> --target <pane>`

The first `web-pane` command launches the application. Subsequent commands run their task and exit, leaving only the single running instance. 
If `web-pane` is run with the same `--id` option the second time, it will either make the page visible (if it was hidded behind some other page or its pane was minimized) or minimize the pane (if the page was already visible).

## Usage

You can open a web page from `Page > Open page` menu command or with `Ctrl+O`. You need to provide an URL and the command will allow you to open a page in current pane, some other existing pane (if you created some already) or in a new one. If you want it opened in a new pane, you need to name it - use some short name like "work", "docs" or "chat", it's used for internal pane tracking.

You can open multiple pages in one pane but only one is visible at the time. To switch to another one use `Ctrl+Tab` (next) or `Ctrl+Shift+Tab` (previous). You'll see a switcher with icons of opened pages and each `Ctrl+Tab` or `Ctrl+Shift+Tab` will switch to following/preceding one. You can close a web page with `Page > Close page` menu command or with `F4`.

You can interact with the page as in normal browser except for context menu and history. There is no context menu unless the page defines a custom one. The example would be Google Maps that allow you to use several custom actions once you press right mouse button. As of history, you can browse back with `Alt+←` and forward with `Alt+→`. There are also menu commands for that.

You can change the dimensions of the pane and move it around (on Linux you can choose to have title-less panes and move them with `Alt` pressed) and the changes will be saved for later. A new pane can be opened with `Pane > New pane` menu command or with `Ctrl+N`. You can also move a web page to another pane (existing or a new one) with `Page > Move page` menu command or with `Ctrl+M`. To minimize a pane use a `Pane > Minimize` or `Alt+↓`. Note that if you chose to hide `web-pane`'s windows from the system's window list it's best to define system-wide keyboard shortcut to bring it back - use `web-pane` command to restore all the panes or `web-pane --target <pane>` to restore only a given one.

## Integrations

Invoking the app with command line's `web-pane ...` would be very tedious. So, it's better to integrate it with your system. It can be done in several ways.

### Activators
A much more convenient way to launch the application is through shortcuts (on Windows: `.lnk` files, on macOS: aliases, on Linux: `.desktop` files).
Create a desktop shortcut and edit it so it runs `web-pane --url <url>` or any of the variants shown above. 

On Linux, example `.desktop` file should look like this:
```
[Desktop Entry]
# Replace the values below with your own
Name=ChatGPT
Exec=web-pane --url https://www.chatgpt.com
Icon=window-new

# Paste the following lines, do not change
Type=Application
StartupWMClass=web-panes
StartupNotify=false
Terminal=false
```

Click on the activator to open the webapp in the pane. The pane will stay atop the other panes, allowing you to peek its contents even while you are using other applications. If you click on the activator again, the pane will minimize. To bring it again, click its activator yet again.

### Batch files
You could make entire layouts of panes with web pages already opened with batch files/scripts. Just create a file with a series of `web-pane ...` commands and make it executable. For example on Linux you could have a web-dev layout with 2 panes defined like this:

```sh
#!/bin/sh
web-pane --url https://chatgpt.com
web-pane --url https://docs.nestjs.com
web-pane --url https://nodejs.org/docs/latest/api/
web-pane --url https://www.facebook.com/messages/t/123456789 --target messages
web-pane --url https://web.whatsapp.com/ --target messages
```

Of course you can create an activator with such a script and run it with one click.

### Docks

Example setup for Linux Mint: Web-pane + two Plank docks. Should work for Debian-based distros (like Ubuntu) as well.

1. Install Plank:
    > `sudo apt install plank`
2. Create two instances of Plank's docks in Autostart:
    - open Startup Applications
    - add an entry with `plank -n dock1 &` command and another with `plank -n dock2 &`
    - run above commands to start Plank's docks manually
    - place one dock on the left and the other on the right side of the screen, configure them to your liking
3. Create the `.desktop` files for the webapps you want to see in the panes. For left pane use command:
    > `web-pane --url <url> --target left`

    For right pane use the same command but omit the `--target` argument.
4. Drag the `.desktop` files to the proper Plank's dock
5. In the "Keyboard" section of the System Settings switch to "Shortcuts" tab and add some global shortcuts, for example:
    - `Alt+Up` with command: `web-pane` to open or bring back the panes when minimized
    - `Ctrl+Shift+PgDn` with command: `bash -c 'web-pane --url "$(xclip -o -selection clipboard)"'` to open to previously copied URL in the main pane. You may need to install `xclip` package with `sudo apt install xclip` to use this shortcut.

Provided you have the application installed and you added Plank to the autostart, it will start automatically and present defined webapp activators. 

## Keyboard shortcuts
- `Ctrl+N` - open a new pane
- `Ctrl+O` - open a new web page in current pane
- `Ctrl+M` - move the current web page to a different pane (already existing or a new one)
- `Ctrl+Shift+Tab` - switch to the previous webapp
- `Ctrl+Tab` - switch to the next webapp
- `Alt+Down` - minimize the pane (click on any activator to unminimize it)
- `F4` - close the current web page
- `Ctrl+F4` - close the current pane
- `Alt+F4` - quit the application
- `Alt+Left` - go back in the webapp
- `Alt+Right` - go forward in the webapp
- `Ctrl+R` - reload the webapp
- `Ctrl+Shift+R` - force-reload the webapp (without cache)
- `Ctrl+Shift+=` - zoom in
- `Ctrl+Shift+-` - zoom out
- `Ctrl+0` - reset zoom
- `F10` - preferences

On Linux you can also move the panes by holding `Alt` and dragging them with the mouse.
