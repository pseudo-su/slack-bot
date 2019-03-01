'use strict';

function buildJsonApiBody({ data, errors, meta }) {
  const body = errors.length ? { meta, errors } : { meta, data };
  return body;
}

function buildSlackBody({ data, errors }) {
  if (errors.length) {
    return 'Something went wrong.';
  }
  return data;
}

function buildResponseBody(responseMode, values) {
  if (responseMode === 'jsonapi') return buildJsonApiBody(values);
  if (responseMode === 'slack') return buildSlackBody(values);
  throw new Error(`Unable to build API response (${responseMode})`);
}

class ApiResponse {
  constructor() {
    this._data = null;
    this._headers = {};
    this._withDefaultHeaders = false;
    this._responseMode = 'slack';
    this._errors = [];
    this._meta = {};
    this._statusCode = 200;
  }
  statusCode(arg = 200) {
    this._statusCode = arg;
    return this;
  }

  meta(arg = {}) {
    this._meta = arg;
    return this;
  }

  errors(arg = []) {
    this._errors = arg;
    return this;
  }

  data(arg) {
    this._data = arg;
    return this;
  }

  responseMode(arg = null) {
    if (!arg) {
      throw new Error(`Must provide a responseMode (${arg})`);
    }
    this._responseMode = arg;
    return this;
  }

  withDefaultHeaders(arg = true) {
    this._withDefaultHeaders = arg;
    return this;
  }

  headers(arg = {}) {
    this._headers = arg;
    return this;
  }

  build() {
    const values = {
      data: this._data,
      errors: this._errors,
      meta: this._meta,
    };
    const statusCode = this._statusCode;
    const headers = this._headers;
    const body = buildResponseBody(this._responseMode, values);

    return {
      statusCode,
      headers,
      body,
    };
  }
}

module.exports = {
  ApiResponse,
};
