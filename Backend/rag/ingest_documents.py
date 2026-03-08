import os
from rag.embedder import embed_text
from rag.vector_store import add_document

DATA_PATH = "data/policies"

for file in os.listdir(DATA_PATH):

    with open(os.path.join(DATA_PATH, file)) as f:

        text = f.read()

        embedding = embed_text(text)

        add_document(text, embedding)

print("Documents loaded into vector DB")