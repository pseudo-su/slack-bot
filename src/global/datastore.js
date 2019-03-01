'use strict';
const { GCP_PROJECT_ID } = require('../config');

const { Datastore } = require('@google-cloud/datastore');
const datastore = new Datastore({
  projectId: GCP_PROJECT_ID,
});

module.exports = {
  datastore,
};
