package features;

import com.intuit.karate.junit5.Karate;

class RoomsTest {
    
    @Karate.Test
    Karate testRooms() {
        return Karate.run("rooms").relativeTo(getClass());
    }    
}