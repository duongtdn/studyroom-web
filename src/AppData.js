"use strict"

import React, { Component } from 'react'
import auth, { isLoggedUser, getUser, logout, authGet } from '@stormgle/auth-client'

import App from './App'
import Login from './Login'
import Error from './Error'

import { parseIDsFromHref } from './location-href'

import env from './env'

const endPoint = {
  login: env.ep.login,
  content: env.ep.content
}

const link = {
  enroll: env.ln.enroll,
  account: env.ln.account,
  resetPassword: env.ln.resetPassword,
  defaultMalePicture: env.ln.dafaultMalePic
}

const progress = {}

class AppData extends Component {
  constructor(props) {
    super(props);
    this.state = { data: null, progress, user: null, error: null }
    this.updateProgress = this.updateProgress.bind(this);
  }

  componentWillMount() {
    auth.onStateChange( (state, user) => {
      if (state === 'authenticated') {
        this._userHasLoggedIn()._loadContentData();
      } else {
        this.setState({ user: null })
      }
    })
  }

  _userHasLoggedIn() {
    const user = getUser();
    if (!user.profile.picture) {
      user.profile.picture = link.defaultMalePicture
    }
    this.setState({ user });
    return this;
  }

  _loadContentData() {
    const { topicId, courseId } = parseIDsFromHref();
    const ep = endPoint.content.replace(":courseId", courseId);
    authGet({
      endPoint: ep,
      service: 'learndesk',
      onSuccess: (data) => {
        this.setState({ data, error: null })
      },
      onFailure: (error) => {
        this.setState({ error : error.status })
      }
    })
    
    return this;
  }

  render() {
    const _display = this.decideDisplayPage();
    return (
      <div>
        <App  data = {this.state.data}
              progress = {this.state.progress}
              onCompletedContent = {this.updateProgress}
              user = {this.state.user}
              logout = {() => this.logout()}
              display = {_display.app}
        />
        <Login endPoint = {endPoint.login}
               onUserLoggedIn = {user => this.onUserLoggedIn(user)} 
               display = {_display.login}
        />
        <Error  naviLink = {link.enroll}
                display = {_display.error}
                errCode = {this.state.error}
        />
      </div>
    )
  }

  decideDisplayPage() {
    const _display = {
      app: 'none',
      login: 'none',
      error: 'none',
    }

    if (!this.state.user) {
      _display.login = 'block';
      return _display
    }

    if (this.state.error) {
      _display.error = 'block';
      return _display
    }

    _display.app = 'block';
    return _display

  }

  onUserLoggedIn(user) {
    
  }

  logout() {
    logout();
  }

  updateProgress({topicId, contentId}) {
    if (!progress[topicId]) {
      progress[topicId] = {};
    }
    progress[topicId][contentId] = true;
    this.setState({ progress })
  }
}

export default AppData
