<%@ page import="java.util.*" %>
<%@ page import="org.apache.log4j.Logger"%>
<%@ page import="org.apache.log4j.Level"%>
<%@ page import="java.lang.RuntimeException"%>
<%@ page import="java.io.*"%>
<%@ page import="org.w3c.dom.*"%>
<%@ page import="java.io.InputStream" %>
<%@ page import="java.util.Properties" %>
<%@ page import="org.apache.commons.codec.binary.Base64"%>
<%@ page import="org.apache.commons.lang.StringEscapeUtils"%>
<%@ page import="org.apache.commons.httpclient.Header" %>
<%@ page import="org.apache.commons.httpclient.HttpClient"%>
<%@ page import="org.apache.commons.httpclient.UsernamePasswordCredentials"%>
<%@ page import="org.apache.commons.httpclient.auth.AuthScope"%>
<%@ page import="org.apache.commons.httpclient.methods.PostMethod"%>
<%@ page import="org.apache.commons.httpclient.methods.PutMethod"%>
<%@ page import="com.hp.csa.security.util.AESHelper" %>
<%@page trimDirectiveWhitespaces="true" %>
<%

/* Initialize the variables*/
String action;
String subId = "";
String catId = "";
String userId = "";
String approvalId = "";
String userpass;
String adminPass;
String url;
String body;
String myResponse;  // Will hold the response body from the cancel request
String csaBaseURL;
int status;         // Will hold the http response status from cancel request
HttpClient client;
Logger log;
StringEscapeUtils esc;

/* Initialize the Logger */
log = Logger.getLogger("CSAEO_Action");
log.setLevel(Level.INFO);

/* Load the csa.properties file */
ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
InputStream stream = classLoader.getResourceAsStream("/csa.properties");
Properties props = new Properties();
props.load(stream);

csaBaseURL = props.getProperty("csa.provider.rest.protocol") + "://" + props.getProperty("csa.provider.hostname") + ":" + props.getProperty("csa.provider.port");

/* Validate required Inputs */
if (request.getParameterMap().containsKey("action")){
  action = request.getParameter("action");
} else{
  out.println("action is required");
  return;
}
if (action.equals("delete")){
  if (request.getParameterMap().containsKey("subId")){
    subId = request.getParameter("subId");
  } else{
    out.println("subId is required");
    return;
  }
}

if (request.getParameterMap().containsKey("catId")){
  catId = request.getParameter("catId");
} else{
  out.println("catId is required");
  return;
}
if (request.getParameterMap().containsKey("approvalId")){
  approvalId = request.getParameter("approvalId");
}

/* Set Fixed values and Build url & request Body */
userId     = "6BC7CE65B5F74D08AA29C8FC40616451"; // The ooInboundUser ID


AESHelper ae = new AESHelper();
adminPass = ae.decrypt(props.getProperty("securityAdminPassword"));

url = "";
body = "";

if (action.equals("delete")){
  url        = csaBaseURL + "/csa/rest/user/multipleSubscription/delete?userIdentifier=" + userId;
  body       = "<ServiceSubscriptionList><ServiceSubscription>"
              +"<id>" + subId + "</id>"
              + "<catalogItem>"
              +"<id>" + catId +"</id>"
              +"<catalog>"
              +"<id>"+ catId +"</id>"
              +"</catalog>"
              +"</catalogItem>"
              +"</ServiceSubscription>"
              +"</ServiceSubscriptionList>";
}
else if (action.equals("cancel")){
  url        = csaBaseURL + "/csa/rest/catalog/" + catId + "/request?userIdentifier=" + userId;
  body       = "<ServiceRequest><description>Manual Fail</description>"
              + "<name>My Fail</name>"
              + "<displayName>My Fail</displayName>"
              + "<artifactContext><id>" + subId + "</id></artifactContext>"
              + "<visibility><name>PUBLIC</name></visibility>"
              + "<requestedAction><name>CANCEL_SUBSCRIPTION</name></requestedAction>"
              + "</ServiceRequest>";
}

else if (action.equals("approve")){
  url         = csaBaseURL + "/csa/rest/catalog/" + catId + "/approval/" + approvalId + "?userIdentifier=" + userId;
  body        = "<ApprovalProcess> <approvalResult>"
              + "<name>APPROVED</name> </approvalResult>"
              + "</ApprovalProcess>";
}
else if (action.equals("deny")){
  url         = csaBaseURL + "/csa/rest/catalog/" + catId + "/approval/" + approvalId + "?userIdentifier=" + userId;
  body        = "<ApprovalProcess> <approvalResult>"
              + "<name>REJECTED</name> </approvalResult>"
              + "<approvalComment>Rejected from CSA Enhanced Operations</approvalComment>"
              + "</ApprovalProcess>";
}
/* Setup the HTTP Client */
/* Todo: encrypt the transport password used here. see JBOSS AS7 encryption */
client = new HttpClient();
client.getParams().setAuthenticationPreemptive(true);
client.getState().setCredentials(
  new AuthScope(AuthScope.ANY_HOST, AuthScope.ANY_PORT),
  new UsernamePasswordCredentials("admin",adminPass)
);

/* This just initializes the HTTP Post object. */
if (action.equals("approve") || action.equals("deny")){
  PutMethod put = new PutMethod(url);
  try {
    put.setDoAuthentication( true );
    put.setRequestHeader("Content-type", "application/xml; charset=UTF-8");
    put.setRequestHeader("Accept", "application/xml; charset=UTF-8");
    put.setRequestBody(body);
    status = client.executeMethod(put);
    if(status == 200){
      out.println("<p><span class='label label-success'>Success</span></p><p><span class='label label-default'>Return Code: "+status+"</span></p>");
    } else{
      out.println("<p><span class='label label-danger'>Error</span><br /></p><p><span class='label label-default'>Return Code: "+status+"</span></p>");
  }
    myResponse = put.getResponseBodyAsString();
    esc = new StringEscapeUtils();
    out.println("<well><pre><code>" + esc.escapeXml(myResponse) + "</code></pre></well>");
  }
  catch(Exception e){
    log.error(action + " Subscription Failed " + e.getMessage());
    e.printStackTrace(response.getWriter());
  }
  finally {
    // release any connection resources used by the method
    put.releaseConnection();
  }
}
else{
  PostMethod post = new PostMethod(url);
  log.info(action + "  Subscription (Experimental) Invoked");
  try {
    post.setDoAuthentication( true );
    post.setRequestHeader("Content-type", "application/xml; charset=UTF-8");
    post.setRequestHeader("Accept", "application/xml; charset=UTF-8");
    post.setRequestBody(body);
    status = client.executeMethod(post);
    if(status == 200){
      out.println("<p><span class='label label-success'>Success</span></p><p><span class='label label-default'>Return Code: "+status+"</span></p>");
    } else{
      out.println("<p><span class='label label-danger'>Error</span><br /></p><p><span class='label label-default'>Return Code: "+status+"</span></p>");
  }
    myResponse = post.getResponseBodyAsString();
    esc = new StringEscapeUtils();
    out.println("<well><pre><code>" + esc.escapeXml(myResponse) + "</code></pre></well>");
  }

  catch(Exception e){
    log.error(action + " Subscription Failed " + e.getMessage());
    e.printStackTrace(response.getWriter());
  }
  finally {
    // release any connection resources used by the method
    post.releaseConnection();
  }
}

%>
