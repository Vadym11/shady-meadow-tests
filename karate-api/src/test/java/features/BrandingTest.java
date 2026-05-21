package features;

import com.intuit.karate.junit5.Karate;

class BrandingTest {
    
    @Karate.Test
    Karate testBranding() {
        return Karate.run("branding").relativeTo(getClass());
    }    
}