# SharePoint Wiki Add-On
###### *Version 0.6.2*
> Add-On's for MS SharePoint wiki sites

## Description of the Add-On's
### The table of contents
The add on takes all headings (currently only `h1`, `h2`, `h3` and `h4`) in the site's main area - marked by element
`#contentBox` - and builds a table of contents menu on the left side of the page. Headings with sub headings can be 
expanded  

Under the menu title you will see a text box which allows you to filter the table of contents
### The editor extensions
#### Basic formatting support
If you open the context menu over normal text, i.e. not coding blocks you get the following options to format the
current selected elements
- Bold
- Italic
- Underlined
- Strikethrough
- Indent
- Outdent
- Ordered list
- Unordered list
- Remove all formatting
- Remove highlighting color from text content

#### Creating Blockquotes
To insert a blockquote into your page press **Create Blockquote** from the context menu.  
To leave the blockquote editing area you can enter the key combination `Ctrl+Enter`.

#### Creating Alerts
To insert an alert block into your page press **Create Alert** from the context menu.
To leave the blockquote editing area you can enter the key combination `Ctrl+Enter`.

> Possible Styles for alerts are `info`, `success`, `warning` and `danger`

To change the style of an alert to a different kind choose the corresponding type from the **Create Alert**-menu.
#### Creating/Editing Coding
This Add-On enhances the editor with the feature to insert/edit coding snippets.  
To insert a(n) (inline) coding block you open the context menu at the position in the wiki page and press the action
`Create Coding Block` or `Create Inline Coding` - if there is some text selection present.
The inserted Coding Area can be recognized the dotted border that surrounds it. To leave the Coding Area and start a 
new paragraph/sentence you can press `Ctrl+Enter`.  
To view/change the properties of the Coding Area you can call the context menu on the coding area, which will show a quick
menu.

Upon Saving the Wikipage and therefore leaving the edit mode the Coding Areas will be transformed into themed Coding 
blocks with correct Syntax Highlighting (done woth [Prism](http://prismjs.com)) 

#### Shortcuts for accessing the menus
- Use `Alt+Shift+T` to access the table contents
- Use `Alt+Shift+M` to show the main menu of the Add-On
- Use `Alt+Shift+C` to access the config menu

#### Additional features
##### Fullscreen image overlays (in read only mode)
If you click on an image it will get opened in a full screen overlay. A click on the `zoom` button in the upper right
corner of the screen will change the image size to its full resolution. The viewport of the image can then be moved via
the standard scroll bars of the browser or by dragging the image with the left mouse button   
To close the full screen overlay either press on the `Close`-button in the upper right corner or press `Esc` on the
keyboard

## Building the Add-On's for your site

### Installation of Node
- Install [Node](https://nodejs.org/dist/v8.9.4/node-v8.9.4-x64.msi).

### Build
``` bash
# install dependencies
npm install

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```  
## Testing
``` bash
# serve with hot reload at localhost:8080
npm run dev
```

When the build process is done, you should see the following structure under the `dist`-folder
```
# example without changing the prompt parameters

dist/
|-- site/
    |-- addons/
        |-- css/
        |-- js/
        |-- index.html
```
Copy the folder under `dist` to the location you passed as the `rootPath`-parameter to the `gulp` task - in this
example it would be at http://www.yourSharepoint.com/site/yourSite.

## Usage
- create a new wiki page in your sharepoint site
- inlude a web part of the type **content editor** and add the path `/site/yourSite/addons/index.html` as path
- Choose *none* as chrome type
- Click **confirm** to complete the setup of the web part
- The Add-On's are now ready use
- You should see the add-on's collapsed sidebar on the left side of the page
