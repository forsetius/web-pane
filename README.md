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
    - run those commands to start Plank's docks manually
    - place one dock on the left and the other on the right side of the screen
3. Create the `.desktop` files for the webapps you want to see in the panes. For left pane use command:
    > `web-pane --id <appId> --url <url> --title <window title> --target left`

    For right pane use the same command but substitute "left" with "right"
4. Move the `.desktop` file to the proper Plank's dock
