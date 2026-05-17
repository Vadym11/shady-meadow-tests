Feature: Shadow Meadows Branding

  Background:
    * url baseApiUrl
    * def expectedName = "Shady Meadows B&B"
    * def emailValidator = read("classpath:helpers/emailValidator.js")

  @smoke  
  Scenario: get all branding and then get the first branding by id
    Given path 'branding'
    * def addressSchema = {"county": "#string", "line1": "#string", "line2": "##string", "postCode": "#string", "postTown": "#string"}
    * def contactSchema = {"email": "#? emailValidator(_)", "name": #(expectedName), "phone": "#string"}
    * def mapSchema = {"latitude": "#number", "longitude": "#number"}
          
    When method Get
    Then status 200
    And match response == 
    """
    {
        "address": "#(addressSchema)",
        "contact": "#(contactSchema)",
        "description": "#string",
        "directions": "#string",
        "logoUrl": "#string",
        "map": "#(mapSchema)",
        "name": #(expectedName)
    }
    """