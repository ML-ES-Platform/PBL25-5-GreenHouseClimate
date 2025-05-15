package md.mirrerror.greenhousebackend.exceptions;

public class ActionCanNotBePerformedOnYourself extends RuntimeException {
    public ActionCanNotBePerformedOnYourself(String message) {
        super(message);
    }
}
