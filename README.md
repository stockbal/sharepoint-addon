# SharePoint Wiki Add-On
###### *Version 0.6.3*
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
This Add-On enhances the editor with ability to insert snippets of programming code with proper syntax styling into the
page. The syntax highlighting is being done with [Prism](http://prismjs.com/index.html).   
Code snippets can either be *inline* or in *block* format.  

To create a coding snippet you just open the context menu at the desired location in the text and press the menu entry
**Create Block Coding** to open the coding editor.  
If you are satisfied with the entered coding and the selected options (language, inline, line numbers) you press and
save and the code will get inserted with the proper syntax highlighting at the current cursor position.  

If you open the context menu over an existing coding block you get the following options
- Cut
- Copy
- Edit
- Convert To Text
- Delete
- Insert  
  - Paragraph before
  - Paragraph after 

> Note: If you trigger the *cut/copy* action, pasting via `Ctrl+V` will not work. You must use the *Paste* action
via the context menu

#### Shortcuts for accessing the menus
- Use `Alt+Shift+T` to access the table contents
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
- Install [Node](https://nodejs.org/dist/v8.9.4/node-v8.9.4-x64.msi) if not already installed

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
