SELECT ca.UUID AS APPROVAL_ID,
art.DISPLAY_NAME as SUBSCRIPTION_NAME,
art.ICON_URL as ICON_URL,
art.CREATED_ON as REQUEST_DATE,
per.COMMON_NAME as REQUESTER,
cat.DISPLAY_NAME as STATUS,
art3.DISPLAY_NAME as CATALOG_NAME,
art3.UUID as CATALOG_ID,
art4.DISPLAY_NAME as CONSUMER_ORG,
art5.DISPLAY_NAME as OFFERING_NAME,
req.UUID as REQUEST_ID,
rad.name as REQUEST_TYPE
FROM csa_approval_process ca
INNER JOIN csa_artifact art ON ca.UUID=art.UUID
INNER JOIN csa_category cat ON ca.approval_result_id = cat.UUID
INNER JOIN csa_person per ON ca.created_by_id = per.UUID
INNER JOIN csa_artifact art2 ON ca.approval_context_id = art2.UUID
INNER JOIN csa_service_req req ON art2.UUID = req.UUID
INNER JOIN csa_artifact art3 on art3.uuid = req.ordered_from_catalog_id
INNER JOIN csa_artifact art4 on art4.UUID = req.consumer_organization_id
INNER JOIN csa_artifact art5 on req.artifact_context_id = art5.UUID
INNER JOIN csa_req_act_detail rad on req.UUID = rad.service_request_id
