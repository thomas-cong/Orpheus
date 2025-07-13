# Orpheus

## A web app for managing, administering, and analyzing cognitive tests. Currently supports RAVLT and the Rey Ostierreth Complex Figure

### Reasoning

The idea behind Orpheus is to provide a centralized platform for digitzed cognitive assessments. These current gold standard examinations are really fairly innocuous to digitize. However, due to their older nature, it is really difficult to justify that the scores capture a lot of the more complicated facets of cognitive decline. For example, in memory recall tests, homonyms or synonyms aren't weighted as potential partial credit. If somebody says, "book" when they were meant to recall "novel", there is an arguable semantic similarity that can be extracted with the introduction of these word embedding models. Similarly, for image input, we can add nuance by calculating direct image similarity. Of course, at bare minimum, this platform matches the scoring accuracy of a clinician for the objective recall tasks. Further development and forkes are welcome.

### Prerequisites

-   Node.js
-   MongoDB
-   Azure Storage Account
-   Azure Speech-to-Text API
-   OpenAI API

### Getting Started

1. Clone the repository

    `git clone https://github.com/thomas-cong/Orpheus.git `

2. Install dependencies

    `npm install`

3. Configure environment variables

    - You will need two Azure Blob Storage resources, one for storing speech, and one for images
    - You will need an Azure transcription resource
    - You will need an OpenAI key for text embeddings
    - You will need a MongoDB database for storing any trial information/results
    - All can be configured in a .ENV file

4. Run the server

    `npm start`

5. Start the main interface

    `npm run dev`

6. Start the data portal

    `npm run dev:mirror`

### Things to Note

There has been very little linting/codebase standardization between commits. Additionally, the codebase is completely functional for these two cognitive assessments, but further changes may be made as development progresses.
