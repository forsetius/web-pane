# web-pane
Utility windows for webapps that integrate with Plank (or other docks)

## Installation
1. Unpack the `.zip` file or clone the project's repository
2. Go to the directory you have the project's files
3. If you:
    - used `.zip` file: run `bash web-pane`
    - cloned the repository: just run `web-pane`
4. From now on you can run the application with `web-pane` from any directory

## Setup
1. Install Plank:
    > `sudo apt install plank`
2. Create two instances of Plank's docks in Autostart:
    - open Startup Applications
    - add an entry with `plank -n dock1 &` command and another with `plank -n dock2 &`
    - run above commands to start Plank's docks manually
    - place one dock on the left and the other on the right side of the screen
3. Create the `.desktop` files for the webapps you want to see in the panes. For left pane use command:
    > `web-pane show <appId> <url> --target left`

    For right pane use the same command but substitute "left" with "right"
    
    Example `.desktop` file should look like this:
    ```
    [Desktop Entry]
    Name=ChatGPT
    Exec=web-pane show chatgpt https://www.chatgpt.com --target left
    Icon=window-new
   
    # Paste the following lines, do not change
    Type=Application
    StartupWMClass=web-panes
    StartupNotify=false
    Terminal=false
    ```

4. Move the `.desktop` files to the proper Plank's dock

## Usage
Provided you have the application installed and added Plank to the autostart, it will start automatically and present defined webapp activators. Click on the activator to open the webapp in the pane. The pane will stay atop the other windows, allowing you to peek its contents even while you are using other applications. If you click on the activator again, the pane will minimize - it's still there, just hidden from the window list. To bring it again, click its activator yet again

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