package features;

import com.intuit.karate.junit5.Karate;

public class BookingTest {
     
     @Karate.Test
     Karate testBooking() {
         return Karate.run("booking").relativeTo(getClass());
     }    
 }