Feature: Get Available Rooms

  Background:
    * url baseApiUrl
    * configure headers = { 'Content-Type': 'application/json' }
    
  Scenario: Get rooms for given dates
    Given path 'room'
    And params { checkin: #(checkin), checkout: #(checkout) }
    When method Get
    Then status 200
    * def availableRooms = response.rooms
    Then match availableRooms == "#[_ > 0]"