public with sharing class cmdbGraphLookup {
    @AuraEnabled
    public static List<Runtime_Service_Graph__c> getGraphRuntimeId(String incidentId) {
        return [SELECT Id, Name, Incident__c FROM Runtime_Service_Graph__c WHERE Incident__c = :incidentId];
    }
}