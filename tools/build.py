import os, sys; sys.path.insert(0, os.path.dirname(__file__))
import json
from sprites import SPRITES, PALETTE
tpl=open(os.path.join(os.path.dirname(__file__),"template.js")).read()
out=tpl.replace("__SPRITES__",json.dumps(SPRITES,separators=(",",":"))).replace("__PALETTE__",json.dumps(PALETTE))
open(os.path.join(os.path.dirname(__file__),"..","parrot.js"),"w").write(out); print(len(out))
