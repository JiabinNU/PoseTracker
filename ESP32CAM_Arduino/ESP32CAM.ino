#include "esp_camera.h"
#include <WiFi.h>
#include "esp_timer.h"
#include "img_converters.h"
#include "Arduino.h"
#include "fb_gfx.h"
#include "soc/soc.h" //disable brownout problems
#include "soc/rtc_cntl_reg.h"  //disable brownout problems
#include <WebSocketsServer.h>

//change the wifi name and password here
const char* ssid = "NETGEAR86";
const char* password = "redjade349";

#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

// open a websocket
WebSocketsServer webSocket = WebSocketsServer(80);


// Called when receiving any WebSocket message
void onWebSocketEvent(uint8_t num,
                      WStype_t type,
                      uint8_t * payload,
                      size_t length) {
 
  // Figure out the type of WebSocket event
  Serial.println("I am here");
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
        webSocket.sendTXT(num, "Connected");

 /***************************************/
 // if a client connect the webserver
  Serial.println("start camera");  
  camera_fb_t * fb = NULL; //fb is the point of camera I think 
  esp_err_t res = ESP_OK;
  size_t _jpg_buf_len = 0;
  uint8_t * _jpg_buf = NULL;
  char * part_buf[64];
  Serial.println("3");
  
  Serial.println("start loop");
  while(true){

 //take a picture with camera
    Serial.println("take a picture");
    fb = esp_camera_fb_get();//fb is getting a frame buffer from camera
    if (!fb) {
      Serial.println("Camera capture failed");
      Serial.printf("fb->width: %uB\n",(uint32_t)(fb->width));
      res = ESP_FAIL;
    } else {
      if(fb->width > 400){
        if(fb->format != PIXFORMAT_JPEG){
          bool jpeg_converted = frame2jpg(fb, 80, &_jpg_buf, &_jpg_buf_len);
          //return the frame buffer back to be reused
          esp_camera_fb_return(fb);
          fb = NULL;
          if(!jpeg_converted){
            Serial.println("JPEG compression failed");
            res = ESP_FAIL;
          }
        } else {
          _jpg_buf_len = fb->len;
          _jpg_buf = fb->buf;
        }
      }
    }

    webSocket.sendBIN(num, _jpg_buf, _jpg_buf_len);
    Serial.printf("I have sent");
  
  Serial.printf("MJPG: %uB\n",(uint32_t)(_jpg_buf_len));
  if(fb){
      esp_camera_fb_return(fb);
      fb = NULL;
      _jpg_buf = NULL;
    } else if(_jpg_buf){
      free(_jpg_buf);
      _jpg_buf = NULL;
    }
    if(res != ESP_OK){
      break;
    }
  delay(1);
}
/********************************/
        
      }
      break;
 
    // Echo text message back to client
    case WStype_TEXT:
      Serial.printf("[%u] Text: %s\n", num, payload);
      webSocket.sendTXT(num, payload);
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
 WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
 Serial.begin(115200);
  Serial.setDebugOutput(false);

  //camera configurarion
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 10000000;
  config.pixel_format = PIXFORMAT_JPEG; 


  // Select lower framesize if the camera doesn't support PSRAM
  if(psramFound()){ 
    //param is psedu ram: check psram is avaialble or not
    config.frame_size = FRAMESIZE_UXGA; 
    //FRAMESIZE_QVGA:320x240//FRAMESIZE_UXGA:1600x1200//FRAMESIZE_SVGA: 800x600
    config.jpeg_quality = 30;
    //10-63 lower number means high quality
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

  
  // Camera init
  esp_err_t err = esp_camera_init(&config);
  //if ESP_Ok is initialize success
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }
  
  // Wi-Fi connection
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected!");
  Serial.print("My IP address: ");
  Serial.println(WiFi.localIP());

  webSocket.begin();
  Serial.println("1");
  webSocket.onEvent(onWebSocketEvent);
  Serial.println("2");
  //
  
}

void loop() {
  webSocket.loop();

}
