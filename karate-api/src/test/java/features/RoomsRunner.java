package features;

import com.intuit.karate.junit5.Karate;

class RoomsRunner {
    
    @Karate.Test
    Karate testRooms() {
        return Karate.run("rooms").relativeTo(getClass());
    }    
}