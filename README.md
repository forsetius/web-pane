# web-pane
Web-pane is a cross-platform desktop application that allows you to open web pages in "panes" - a kind of always-on-top windows.

It is intended to provide an ability to browse a web page and have it right at your fingertips, while working with other applications. Such a pair could be a chat window and a web browser, a documentation and a code editor or Wikipedia and a text editor. 

You can have up to two panes (right now, it will be more flexible in the future), and each of them can host many web pages. In each pane, only one page is visible at a time and you can switch between them either by keyboard shortcuts, running a command or by clicking on the dock or desktop activators (if you did setup them). Running it by issuing a command allows for flexible integrations, like using a dock or a panel to open the web page.

## Installation
The application uses the Electron framework. Thus, it is available for Linux, Windows and MacOS.
To obtain the application, you can either:
- download the latest release from the [releases page](https://github.com/forsetius/web-pane/releases)
- clone the repository and build the application yourself

For now (v0.8.0), the application is tested only on Linux. Tests on Windows are in progress.

You need Node.js installed to build the application. In the future, the application will be dockerized so developing it will be easier.

### Instalation from the repository
To install the application from the repository, you need to:
1. clone the project's repository
2. go to the directory you have the project's files
3. run `web-pane`
4. From now on you can run the application with `web-pane` from any directory

## Basic invocation
Web-pane can be started in various ways depending on your integrations. Still, in every case it is started by a command.

The simplest invocation is:
> `web-pane --url <url>` - opens the webapp in the right (default) window

You can also specify the target window:
> `web-pane --url <url> --target left` - opens the webapp in the left window

Internally, the application creates an ID for each webapp out of the domain portion of its URL. 
That means that if you have two webapps with the same domain, like: 
- `https://www.facebook.com` for Facebook
- `https://www.facebook.com/messages/t/123456789` for Facebook Messenger
  they will be treated as the same webapp and overwrite one another. To overcome this, you can add an `--id` argument:
> `web-pane --url <url> --id <id>` - opens the webapp with given ID

The command issued first time will open the web page in a pane. Later invocations will either make it visible (if another web page is visible in the pane it will be replaced with this one) or will minimize the pane if it is already visible.

## Example setup for Linux: Web-pane + Plank
These instructions are for Linux Mint but would work for Debian-based distros (like Ubuntu) as well.
1. Install Plank:
    > `sudo apt install plank`
2. Create two instances of Plank's docks in Autostart:
    - open Startup Applications
    - add an entry with `plank -n dock1 &` command and another with `plank -n dock2 &`
    - run above commands to start Plank's docks manually
    - place one dock on the left and the other on the right side of the screen, configure them to your liking
3. Create the `.desktop` files for the webapps you want to see in the panes. For left pane use command:
    > `web-pane --url <url> --target left`

    For right pane use the same command but substitute "left" with "right" (or omit the `--target` argument)
    
    Example `.desktop` file should look like this:
    ```
    [Desktop Entry]
    # Replace the values below with your own
    Name=ChatGPT
    Exec=web-pane https://www.chatgpt.com
    Icon=window-new
   
    # Paste the following lines, do not change
    Type=Application
    StartupWMClass=web-panes
    StartupNotify=false
    Terminal=false
    ```

4. Move the `.desktop` files to the proper Plank's dock
5. In the "Keyboard" section of the System settings switch to "Shortcuts" tab and add some global shortcuts, for example:
    - `Alt+Up` with command: `web-pane https://chatgpt.com` to open or bring back the ChatGPT pane even if it is not yet started or is minimized
    - `Ctrl+Shift+PgDn` with command: `bash -c 'web-pane --url "$(xclip -o -selection clipboard)"'` to open to previously copied URL in the right pane. You may need to install `xclip` package with `sudo apt install xclip` to use this shortcut.

Provided you have the application installed and you added Plank to the autostart, it will start automatically and present defined webapp activators. Click on the activator to open the webapp in the pane. The pane will stay atop the other windows, allowing you to peek its contents even while you are using other applications. If you click on the activator again, the pane will minimize - it's still there, just hidden from the window list. To bring it again, click its activator yet again

## Usage

When you click on some other activator, its webapp will replace the previous one in its pane. You can switch between the webapps by clicking on the activators or by using the keyboard shortcuts: `Ctrl+Tab` and `Ctrl+Shift+Tab`. There are other shortcuts available:
- `Alt+Down` - minimize the pane (click on any activator to unminimize it)
- `Ctrl+F4` - close the webapp
- `Alt+F4` - quit the application
- `Ctrl+R` - reload the webapp
- `Ctrl+Shift+R` - force-reload the webapp (without cache)
- `Ctrl+Shift+=` - zoom in
- `Ctrl+Shift+-` - zoom out
- `Ctrl+0` - reset zoom
- `Alt+Left` - go back in the webapp
- `Alt+Right` - go forward in the webapp
- `Ctrl+Shift+Tab` - switch to the previous webapp
- `Ctrl+Tab` - switch to the next webapp
- `F10` - preferences

You can also move the windows by holding `Alt` and dragging them with the mouse.
