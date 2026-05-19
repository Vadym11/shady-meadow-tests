package features;

import com.intuit.karate.junit5.Karate;

public class BookingRunner {
     
     @Karate.Test
     Karate testBooking() {
         return Karate.run("booking").relativeTo(getClass());
     }    
 }