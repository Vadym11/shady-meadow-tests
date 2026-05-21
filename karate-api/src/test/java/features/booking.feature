Feature: Shadow Meadows Bookings

  Background:
    * url baseApiUrl
    * configure headers = { 'Content-Type': 'application/json' }
    
  Scenario: Book a room for given dates
    Given path 'room'
    * def dates = call read('classpath:helpers/dates.js')
    * def checkinDate = dates.checkin
    * def checkoutDate = dates.checkout
    * def firstName = "John"
    * def lastName = "Doe"
    And params { checkin: #(checkinDate), checkout: #(checkoutDate) }
    When method Get
    Then status 200
    * def availableRooms = response.rooms
    Then match availableRooms == "#[_ > 0]"
    * def roomId = availableRooms[0].roomid

    And path 'booking'
    * def requestBody = 
    """
    {
      "roomid": #(roomId),
      "firstname": #(firstName),
      "lastname": #(lastName),
      "depositpaid": true,
      "bookingdates": { "checkin": #(checkinDate), "checkout": #(checkoutDate) }
    }
    """
    When request requestBody
    And method Post
    Then status 201
    Then match response ==
    """
    {
      "bookingid": "#number",
      "roomid": #(roomId),
      "depositpaid": true,
      "firstname": #(firstName),
      "lastname": #(lastName),
      "bookingdates":
        {
          "checkin": "#(checkinDate)",
          "checkout": "#(checkoutDate)"
        }
    }
    """
