Feature: Shady Meadows Bookings

  Background:
    * url baseApiUrl
    * configure headers = { 'Content-Type': 'application/json' }
    * def dates = callonce read('classpath:helpers/dates.js')
    
  Scenario: Book a room for given dates
    * def firstName = "John"
    * def lastName = "Doe"
    * def availableRooms = karate.call('classpath:helpers/get-available-rooms.feature', dates).availableRooms
    * def roomId = availableRooms[0].roomid

    Given path 'booking'
    And request 
    """
    {
      "roomid": #(roomId),
      "firstname": #(firstName),
      "lastname": #(lastName),
      "depositpaid": true,
      "bookingdates": #(dates)
    }
    """
    When method Post
    Then status 201
    And match response ==
    """
    {
      "bookingid": "#number",
      "roomid": #(roomId),
      "depositpaid": true,
      "firstname": #(firstName),
      "lastname": #(lastName),
      "bookingdates": #(dates)
    }
    """
