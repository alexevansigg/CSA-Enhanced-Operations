<%--
  - Author(s): Alexander Evans (Hewlett-Packard)
  - Date: 21/10/2016
  - @(#)
  - Description: getData.jsp is a custom servlet which will query a list of subscriptions from CSA and format it into a json object
  - you can pass the parameter retired=false to omit the retired subscriptions from the json object (this can drastically reduce the
  - response size/time.
  --%>
<%@ page import="com.hp.csa.web.util.CSAIntegrationHelper" %>
<%@ page import="java.util.*" %>
<%@ page import="javax.sql.*" %>
<%@ page import="net.minidev.json.JSONObject" %>
<%@ page import="net.minidev.json.JSONArray" %>
<%@ page import="net.minidev.json.JSONValue" %>
<%@ page import="org.apache.log4j.Logger"%>
<%@ page import="org.apache.log4j.Level"%>
<%@ page import="java.io.FileInputStream "%>
<%@ page import="java.io.File "%>

<%

/* Initialize Variables */
java.sql.Connection con = null;
java.sql.ResultSet rs = null;
java.sql.PreparedStatement pstmt = null;
java.sql.ResultSetMetaData rsmd;
javax.naming.Context ic = new javax.naming.InitialContext();
DataSource ds;

String jndi = "java:jboss/datasources/csaDS";

String retiredClause = "Retired";
String sqlFile = "getSubs.sql";
String sql;                       // Will hold the sql statement
String columnName;                // Will hold each column name
int columnCount;                  // Will hold the number of columns returned in the query

JSONObject jsObj = new JSONObject();
JSONArray jsArr = new JSONArray();
JSONObject jsRes = new JSONObject();

/*
** Initialize the logger
*/
Logger log = Logger.getLogger("options.jsp");
log.setLevel(Level.INFO);


/* Override the Clause if the retired attribute is sent. */
if(request.getParameterMap().containsKey("retired")){
  if(request.getParameter("retired").equals("true")){
    // Oracle doesnt like blank string so making one up here which surely doesnt match
    retiredClause = "Yeahaa";
  }
}

if (request.getParameterMap().containsKey("sqlFile")){
  sqlFile = request.getParameter("sqlFile");
}


try{
  ds = (DataSource)ic.lookup(jndi);
  con = ds.getConnection();
}catch(Exception cnfex){
  log.error(cnfex.getMessage());
}

try{
  File jsp = new File(request.getSession().getServletContext().getRealPath(request.getServletPath()));
  File dir = jsp.getParentFile();
  File file = new File(dir + "/sql/" + sqlFile);
  FileInputStream fis = new FileInputStream(file);
  byte[] data = new byte[(int) file.length()];
  fis.read(data);
  fis.close();
  sql = new String(data, "UTF-8");
  pstmt = con.prepareStatement(sql);

  // Set the Retired clause to exclude retired entries
  if (sql.contains("?")){
    pstmt.setString(1, retiredClause);
  }

  rs = pstmt.executeQuery();

  // Get the Column headers
  rsmd = rs.getMetaData();
  columnCount = rsmd.getColumnCount();

  while( rs.next() ){
    jsObj = new JSONObject();
    /* Iterate over each column and add it to the json Object */
    for (int i = 1; i <= columnCount; i++ ) {
      /* capitalize the column names to standardize with different RDBMS systems */
      columnName = rsmd.getColumnName(i).toUpperCase();
      jsObj.put(columnName, rs.getString(columnName));
    }

    /* Add the JSON object which represents a single row to the JSON Array */
    jsArr.add(jsObj);
  }

  jsRes.put("data", jsArr);
  out.println(JSONValue.toJSONString(jsRes));

}catch(Exception e){
  out.println("<div id=\"error\">");
  e.printStackTrace(new java.io.PrintWriter(out));
  out.println("</div>");
}
finally{
	if(rs!=null) rs.close();
	if(con!=null) con.close();
}
%>
