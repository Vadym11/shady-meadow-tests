Feature: Shady Meadows Rooms

  Background:
    * url baseApiUrl
 
  Scenario: get all rooms
    Given path 'room'
          
    When method Get
    Then status 200
    And match response.rooms == "#[]"
    And match each response.rooms == "#object"
    And match response.rooms[*].roomPrice contains "#? _ > 0"
