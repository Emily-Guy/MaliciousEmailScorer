function buildAddOn(e) {
  var accessToken = e.messageMetadata.accessToken;
  GmailApp.setCurrentMessageAccessToken(accessToken);
  
  var messageId = e.messageMetadata.messageId;
  var message = GmailApp.getMessageById(messageId);
  
  // data collection
  var emailData = {
    "sender": message.getFrom(),
    "subject": message.getSubject(),
    "body": message.getPlainBody(),
    "links": extractLinks(message.getPlainBody())
  };

  //send to backend server
  var options = {
    'method' : 'post',
    'contentType': 'application/json',
    'payload' : JSON.stringify(emailData),
    'muteHttpExceptions': true
  };
  
  // ngrok 
  var response = UrlFetchApp.fetch('https://rug-suffix-delighted.ngrok-free.dev/analyze', options);
  var content = response.getContentText();
  var result = JSON.parse(content);
  
  // inner test
  console.log("Server response: " + content);

  // result card
  return createResultCard(result);
}

/**
 * find links in text
 */
function extractLinks(text) {
  var re = /https?:\/\/[^\s]+/g;
  return text.match(re) || [];
}

/**
 * result card function
 */
function createResultCard(result) {
  var headerTitle = "Email Security Analysis";
  var color;

  if (result.score >= 70) {
    color = "#D93025"; // Red
  } else if (result.score >= 30) {
    color = "#FF8C00"; // Orange
  } else {
    color = "#188038"; // Green
  }

  var header = CardService.newCardHeader()
    .setTitle(headerTitle)
    .setSubtitle("Risk Assessment Results");

  var scoreSection = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph()
      .setText("<b>Verdict:</b> <font color=\"" + color + "\">" + result.verdict.toUpperCase() + "</font>"))
    .addWidget(CardService.newTextParagraph()
      .setText("<b>Risk Score:</b> " + result.score + "/100"));

  var reasonsSection = CardService.newCardSection()
    .setHeader("Analysis Details");

  if (result.reasons && result.reasons.length > 0) {
    for (var i = 0; i < result.reasons.length; i++) {
      // Clean text: No dashes, no bullets, forced LTR
      var cleanText = "\u200E" + result.reasons[i];
      
      reasonsSection.addWidget(CardService.newTextParagraph().setText(cleanText));
    }
  } else {
    reasonsSection.addWidget(CardService.newTextParagraph().setText("\u200ENo suspicious patterns found"));
  }

  return CardService.newCardBuilder()
    .setHeader(header)
    .addSection(scoreSection)
    .addSection(reasonsSection)
    .build();
}