import os
import uuid

# Generate APPLITOOLS_BATCH_ID for xdist run in case it was not provided externally
os.environ["APPLITOOLS_BATCH_ID"] = os.getenv("APPLITOOLS_BATCH_ID", str(uuid.uuid4()))
# Keep batch open after runner termination
os.environ["APPLITOOLS_DONT_CLOSE_BATCHES"] = "true"
