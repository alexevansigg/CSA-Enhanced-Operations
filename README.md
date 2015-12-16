
#  CSA Operations Enhanced

---
####  Version 0.04
----

This plugin allows a *Super Admin* to manage Subscriptions across multiple users and organisations efficiently. [See Here](http://alexevansigg.github.io/CSA-Enhanced-Operations)

---
#### Installation Instructions
---

1. Create the folder custom-content (if it doesnt allready exist) in directory **<csahome>/jboss-as/standalone/csa.war**
2. Extract the Plugin contents into the custom-content folder, observe the correct folder structure in the custom-content folder as below:

 File Contents / Folder Structure
 + CSA-Enhanced-Operations/assets/css/bootstrap-toggle.css
 + CSA-Enhanced-Operations/assets/css/bootstrap-toggle.min.css
 + CSA-Enhanced-Operations/assets/css/bootstrap.min.css
 + CSA-Enhanced-Operations/assets/css/datatables.bootstrap.css
 + CSA-Enhanced-Operations/assets/css/datatables.colVis.css
 + CSA-Enhanced-Operations/assets/css/dataTables.responsive.css
 + CSA-Enhanced-Operations/assets/css/dataTables.fixedHeader.css
 + CSA-Enhanced-Operations/assets/css/dataTables.responsive.css
 + CSA-Enhanced-Operations/assets/fonts/glyphicons.*
 + CSA-Enhanced-Operations/assets/js/bootstrap-toggle.js
 + CSA-Enhanced-Operations/assets/js/bootstrap-toggle.min.js
 + CSA-Enhanced-Operations/assets/js/bootstrap.min.js
 + CSA-Enhanced-Operations/assets/js/dataTables.bootstrap.js
 + CSA-Enhanced-Operations/assets/js/bootstrap-colVis.js
 + CSA-Enhanced-Operations/assets/js/dataTables.fixedHeader.min.js
 + CSA-Enhanced-Operations/assets/js/dataTables.responsive.js
 + CSA-Enhanced-Operations/assets/js/jquery.dataTables.min.js
 + CSA-Enhanced-Operations/assets/js/jquery.js
 + CSA-Enhanced-Operations/assets/js/jquery.min.js
 + CSA-Enhanced-Operations/css/CSA-Enhanced-Operations.css
 + CSA-Enhanced-Operations/js/CSA-Enhanced-Operations.js
 + CSA-Enhanced-Operations/pages/getSubs.jsp
 + CSA-Enhanced-Operations/pages/action.jsp
 + CSA-Enhanced-Operations/index.jsp 						
 + CSA-Enhanced-Operations/README.md
 + CSA-Enhanced-Operations/setup.json

3. Add the following entry to the csa.war/dashboard/config.json
	(inside main.tiles array or in sub panel see **Configuration guide** if unsure how to manipulate this file)
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
4. Open the file csa.war/dashboard/messages/common/messages.properties and location section entitled:
  ```
  # Page titles and descriptions, used for the dashboard tiles and for navigation views
  ```
  Add the following entries

  ```JSON
  	CSA-Enhanced-Operations=Enhanced Operations
  	CSA-Enhanced-Operations_description=This experimental feature allows a Super User to
  	Manage Subscriptions across all organizations efficiently (Experimental)
  ```

5. To fix the CSA styling on the dashboard you can add the following css snippet to the end of the file **csa.war/dashboard/css/base.css** to make the Tile Title fit better.

  ```CSS
  	.tile h3 {
  		white-space:inherit;
  		font-size:1.4em;
  	}
  ```

6. Configure the settings in csa.war/custom-content/CSA-Enhanced-Operations/setup.json

	Name | Description
	------------- | -------------
	MPP_HOST 					| The url of a MPP instance, Required for Consumer Admin Links  e.g https://localhost:8089/
	DATA_URL 					| The path to the URL for retrieving the Subscriptions default. getSubs.jsp
	ENABLE_CONSUMER_ADMIN_LINKS | Set as false disable direct links to Manage Subscriptions as Consumer admin
	ENABLE_CANCEL_LINKS 		| Set as false to disable cancel subscription functionality
	ENABLE_RESUME_LINKS			| Set as false to disable resuming paused subscription functionality
	ENABLE_DELETE_LINKS			| Set as false to disable deleting offline subscription functionality
	REQUIRE_CONFIRMATION		| Set as false to determine the default behaviour regarding confirmation prompts
	SHOW_RETIRED				| Set as false to only show active artifacts (Can be overriden on Load)
	DEFAULT_DISPLAY_LENGTH		| How many rows should be displayed (Default 25, Possible values 10,25,50 or ALL)
	USE_FIXED_HEADER			| Set as false to disable the fixed header behaviour
	CONFIG_CACHE				| Integer representing the number of days end user configuration remain in browser cache (Default 5)
	SEARCH_TERM					| The default value set in the Datatables search field (Default Empty String)
	VISIBLE						| An object array of column visibility which is shown in the sortable table, true = show in table, false = show only in detail (drilldown).


---
#### Known Issues

1. If not signed into MPP organisation then Consumer Admin links may redirect to incorrect login screen (needs some attention)
2. After session timeout Refresh request on Datatable throws json error instead of redirecting to login.
3. No visual feedback on refresh action (unless the data response has changed)
4. FixedHeader sometimes doesn't align to column widths
