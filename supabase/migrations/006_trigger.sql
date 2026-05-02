CREATE OR REPLACE FUNCTION update_room_status_on_session_done()
RETURNS TRIGGER AS $$
DECLARE
  other_status TEXT;
  other_role   TEXT;
BEGIN
  IF NEW.role = 'A' THEN other_role := 'B';
  ELSE other_role := 'A';
  END IF;

  SELECT status INTO other_status
  FROM sessions
  WHERE room_id = NEW.room_id AND role = other_role;

  IF other_status = 'DONE' THEN
    UPDATE rooms SET status = 'BOTH_DONE' WHERE id = NEW.room_id;
  ELSIF NEW.role = 'A' THEN
    UPDATE rooms SET status = 'A_DONE' WHERE id = NEW.room_id;
  ELSE
    UPDATE rooms SET status = 'B_DONE' WHERE id = NEW.room_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_session_done
  AFTER UPDATE OF status ON sessions
  FOR EACH ROW
  WHEN (NEW.status = 'DONE' AND OLD.status != 'DONE')
  EXECUTE FUNCTION update_room_status_on_session_done();
