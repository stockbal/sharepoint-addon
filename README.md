# SharePoint Wiki Add-On
###### *Version 1.0.2*
> Add-On's for MS SharePoint wiki sites

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
