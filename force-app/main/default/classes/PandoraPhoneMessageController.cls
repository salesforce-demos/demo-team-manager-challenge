public with sharing class PandoraPhoneMessageController {
    
    @AuraEnabled
    public static String saveTranscript(String transcript, String sessionId) {
        try {
            // Use 'generic' if sessionId is blank
            if (String.isBlank(sessionId)) {
                sessionId = 'generic';
            }
            
            // Create new Pandora_Phone_Message__c record
            Pandora_Phone_Message__c phoneMessage = new Pandora_Phone_Message__c();
            phoneMessage.Phone_Message__c = transcript;
            phoneMessage.Session_ID__c = sessionId;

            System.debug('phoneMessage: ' + phoneMessage);
            
            // insert phoneMessage;
            
            return 'success';
        } catch (Exception e) {
            throw new AuraHandledException('Error saving transcript: ' + e.getMessage());
        }
    }
}