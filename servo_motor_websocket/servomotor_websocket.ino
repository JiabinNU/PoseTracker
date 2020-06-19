#include <WiFi.h>
#include <WebSocketsServer.h>
#include <Servo.h>



Servo bottomservo;  
// Constants
const char* ssid = "NETGEAR86";
const char* password = "redjade349";
String string = String(5);
int pos = 0;



// Globals
WebSocketsServer webSocket = WebSocketsServer(80);
 
// Called when receiving any WebSocket message
void onWebSocketEvent(uint8_t num,
                      WStype_t type,
                      uint8_t * payload,
                      size_t length) {
 
  // Figure out the type of WebSocket event
  switch(type) {
 
    // Client has disconnected
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected!\n", num);
      break;
 
    // New client has connected
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocket.remoteIP(num);
        Serial.printf("[%u] Connection from ", num);
        Serial.println(ip.toString());
      }
      break;
 
    // Echo text message back to client
    case WStype_TEXT:
      Serial.printf("[%u] Text: %s\n", num, payload);
      webSocket.sendTXT(num, payload);
      string = String((char*)payload);
      
      // change the received data to int type
      pos= string.toInt();
      Serial.printf("pos is %d",pos);
      bottomservo.write(pos);
      break;
 
    // For everything else: do nothing
    case WStype_BIN:
    case WStype_ERROR:
    case WStype_FRAGMENT_TEXT_START:
    case WStype_FRAGMENT_BIN_START:
    case WStype_FRAGMENT:
    case WStype_FRAGMENT_FIN:
    default:
      break;
  }
}
 
void setup() {

  
 bottomservo.attach(13);
  // Start Serial port
  Serial.begin(115200);
 
  // Connect to access point
  Serial.println("Connecting");
  WiFi.begin(ssid, password);
  while ( WiFi.status() != WL_CONNECTED ) {
    delay(500);
    Serial.print(".");
  }
 
  // Print our IP address
  Serial.println("Connected!");
  Serial.print("My IP address: ");
  Serial.println(WiFi.localIP());
 
  // Start WebSocket server and assign callback
  webSocket.begin();
  webSocket.onEvent(onWebSocketEvent);
}
 
void loop() {
 
  // Look for and handle WebSocket data
  webSocket.loop();
}
