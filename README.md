
#  CSA Operations Enhanced

---
####  Current Version 0.08
----

This plugin allows a *Super Admin* to manage Subscriptions across multiple users and organisations efficiently. [See Here](http://alexevansigg.github.io/CSA-Enhanced-Operations)

![CSA Enhanced Operations interface](assets/img/capture.png "CSA Example Interface")


The following features are exposed in this plugin with the aim of enhancing the CSA Operations experience

- __Global (Greedy) field filter__ – Single Search field across all exposed columns.
- __Individual Field Search filters__ - (e.g when you need to filter on a specific columns only)
- __Sorting__ on any field.
- __Individual Cancel/Delete/Resume Subscriptions__ - without the annoying drill down into the subscriptions
- __Modify Subscription Page Link__ - Requires Consumer Admin Session opened in MPP in advance.
- __Service Instance Page Link__ - Requires Consumer Admin Session opened in MPP in advance.
- Direct link to __Service Topology View__
- Direct Link to *standard* __Operations tab Overview__
- __Export__ Filtered Subscriptions to __Clipboard__ (tab separated) or as __Excel__
- Optionally Expose _Design bespoke Properties__ from Service Component Model (e.g. IP Address of NIC components or Hostnames of Server Components)
- __Display Retired Subscriptions__ - Subs that have been deleted from CSA and no longer visible in the *standard* operations console
- A local cache of the individual user preferences for configuration of the tool.
- Fullscreen mode - For utilising more screen space.


---
#### CSA Compatability Matrix
---

The Tool has been tested / developed againsnt the following configurations, in both windows base and linux installations,
it's likely other configurations work perfectly, it is after platform agnostic.

|CSA Version|Database|CEO Tested|
|-------|-----------|-----|
| 4.2   | MSSQL     | Yes |
| 4.2   | ORACLE    | Yes |
| 4.2   | POSTGRES  | Yes |
| 4.5   | MSSQL     | Yes |
| 4.5   | ORACLE    | Yes |
| 4.5   | POSTGRES  | Yes |
| 4.6   | MSSQL     | Yes |
| 4.6   | ORACLE    | Yes |
| 4.6   | POSTGRES  | Yes |
| 4.7   | POSTGRES  | Yes |
| 4.7   | ORACLE    | Yes |
| 4.8   | POSTGRES  | Yes |

---
#### Installation Instructions
---

1. Create the folder custom-content (if it doesnt allready exist) in directory **<CSAHOME>/jboss-as/standalone/csa.war**
2. Extract the Plugin contents into the custom-content folder, observe the correct folder structure in the custom-content folder as below:

 File Contents / Folder Structure

 + CSA-Enhanced-Operations/assets/css/bootstrap-toggle.css
 + CSA-Enhanced-Operations/assets/css/bootstrap-toggle.min.css
 + CSA-Enhanced-Operations/assets/css/bootstrap.min.css
 + CSA-Enhanced-Operations/assets/css/dataTables.combined.css
 + CSA-Enhanced-Operations/assets/css/dataTables.combined.min.css
 + CSA-Enhanced-Operations/assets/fonts/glyphicons.*
 + CSA-Enhanced-Operations/assets/js/bootstrap-toggle.js
 + CSA-Enhanced-Operations/assets/js/bootstrap-toggle.min.js
 + CSA-Enhanced-Operations/assets/js/bootstrap.min.js
 + CSA-Enhanced-Operations/assets/js/dataTables.combined.js
 + CSA-Enhanced-Operations/assets/js/dataTables.combined.min.js
 + CSA-Enhanced-Operations/assets/js/jquery.js
 + CSA-Enhanced-Operations/assets/js/jquery.min.js
 + CSA-Enhanced-Operations/css/CSA-Enhanced-Operations.css
 + CSA-Enhanced-Operations/js/CSA-Enhanced-Operations.js
 + CSA-Enhanced-Operations/pages/getSubs.jsp
 + CSA-Enhanced-Operations/pages/action.jsp
 + CSA-Enhanced-Operations/index.jsp 						
 + CSA-Enhanced-Operations/README.md
 + CSA-Enhanced-Operations/setup.json

3. Add the corresponding entry to the csa.war/dashboard/config.json depending on the installed csa version.
  (inside main.tiles array or in sub panel see **CSA Configuration guide** if unsure how to manipulate this file)

  **CSA 4.2**
  ```JSON
  	{
  		"id": "CSA-Enhanced-Operations",
  		"name": "CSA-Enhanced-Operations",
  		"description": "CSA-Enhanced-Operations_description",
  		"enabled": true,
  		"style": "custom-tile-header",
  		"target": "iframe",
  		"data": "/csa/custom-content/CSA-Enhanced-Operations/",
  		"helptopic": "console_help",
  		"roles": ["CSA_ADMIN"]
  	}
  ```
  **CSA 4.6+**
  ```JSON
  	{
  		"id": "CSA-Enhanced-Operations",
  		"name": "CSA-Enhanced-Operations",
  		"description": "CSA-Enhanced-Operations_description",
  		"enabled": true,
  		"style": "custom-tile-header",
  		"type": "iframe",
  		"url": "/csa/custom-content/CSA-Enhanced-Operations/",
  		"helptopic": "console_help",
  		"roles": ["CSA_ADMIN"]
  	}
  ```

4. Open the file **csa.war/dashboard/messages/common/messages.properties** and navigate to the section entitled:
  ```
  # Page titles and descriptions, used for the dashboard tiles and for navigation views
  ```
  Add the following entries

  ```JSON
  	CSA-Enhanced-Operations=Enhanced Operations
  	CSA-Enhanced-Operations_description=This experimental feature allows a Super User to
  	Manage Subscriptions across all organizations efficiently (Experimental)
  ```

5. To fix the CSA styling on the dashboard you can add the following css snippet to the end of the file **csa.war/dashboard/css/base.css**. This will prevent the text from overlaying when viewing the dashboard on smaller viewports.

  ```CSS
  	.tile h3 {
  		white-space:inherit;
  		font-size:1.4em;
  	}
  ```

6. As the plugin is installed to a custom directory in the csa webapp it's a good idea to add an intercept-url directive to the ```applicationContext-security.xml```. Adding such a rule will check the user accessing the url is already authenticated with CSA. When the session is not authenticated the directive will redirect them to the login page. Adding the below mentioned directive will prevent exceptions being thrown and errors being output in the csa.log.
  ```xml
  <intercept-url access="isAuthenticated()" pattern="/custom-content/**"/>
  ```

7. Configure the settings in **csa.war/custom-content/CSA-Enhanced-Operations/setup.json**

|Name|Description|Default|
|----------------------------|-----------------------------------------------------------------------|-------------------------|
|MPP_HOST 		               | The url of a MPP instance, Required for Consumer Admin Links          | https://localhost:8089/ |
|DATA_URL 				           | The path to the URL for retrieving the Subscriptions                  | pages/getSubs.jsp       |
|ENABLE_CONSUMER_ADMIN_LINKS | Enables direct links to Manage Subscriptions as Consumer Admin        | true                    |
|ENABLE_CANCEL_LINKS 		     | Enables Cancel subscription functionality                             | true                    |
|ENABLE_RESUME_LINKS			   | Enables resuming paused subscription functionality                    | true                    |
|ENABLE_DELETE_LINKS			   | Set as false to disable deleting offline subscription functionality   | true                    |
|REQUIRE_CONFIRMATION		     | Whether a confirmation prompt is display before submitting requests   | true                    |
|SHOW_RETIRED				         | Choose whether to include retired artifacts by default                | false                   |
|USE_FIXED_HEADER			       | Set as false to disable the fixed header behaviour                    | true                    |
|CACHE_NAME                  | The name of the http cookie used for storing user preferences         | CSA-E-O-Conf            |
|CONFIG_CACHE				         | Expiry period in days of user cache                                   | 5                       |
|DEFAULT_DISPLAY_LENGTH      | How many rows are displayed, possible values 10,25,50 or ALL          | 25                      |
|SEARCH_TERM					       | The default value set in the Datatables search field                  | "<Empty String>"        |
|ADVANCED_SEARCH             | The default setting for the individual column search field            | true                    |
|COLUMNS						         | Table column definitions                                              | see below               |

---
#### Optional: SQL Query and Column Customization
---

The datatable sources it's dataset from SQL queries defined in the folder **/pages/sql/** When the SQL queries are modified to return additional/alternative fields then the columns definition inside the setup.json file must also be updated.

The dataset returned from the SQL query is parsed into a JSON object in a format which is directly consumed by the datatable. any column names returned from the query are capitalised to ensure standardisation between different RDBMS.

The column definitions should look as follows

```JSON
[
    {"title": "Subscription Name",     "data": "SUBSCRIPTION_NAME" },
    {"title": "Icon",                  "data": "ICON_URL",          "class":"text-center" },
    {"title": "Instance Name",         "data": "INSTANCE_NAME"},
    {"title": "Owner Group",           "data": "SUBCRIPTION_OWNER_GROUP"}        
]
```

Each entry in the Object Array denotes a single column in the datatable, The title attribute is contains the display name of the field, the data attribute contains the name of the field in the JSON object returned by the SQL query (important this is always capital), The class field can contain the following:
- **text-center** - Jusitfies the column in the center.
- **text-left** - Justifies the column to the left.
- **text-right** - Justifies the column to the right.
- **none** - Hides the column from the table and only displays it in the drill down summary.
