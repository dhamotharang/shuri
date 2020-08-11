import 'matsumoto/styles';
import '../../styles';

import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import ScrollToTop from 'matsumoto/src/core/misc/scroll-to-top';
import AuthCallback from 'matsumoto/src/core/auth/callback';
import AuthSilent from 'matsumoto/src/core/auth/silent';
import AuthDefault from 'matsumoto/src/core/auth/default';
import AuthLogout from 'matsumoto/src/core/auth/logout';
import Footer from 'matsumoto/src/parts/footer';
import TopAlert from 'matsumoto/src/parts/top-alert';
import Modal from 'matsumoto/src/parts/modal';
import { Loader } from 'matsumoto/src/simple';
import { Authorized } from 'matsumoto/src/core/auth';
import i18n from 'core/i18n';
import Header from 'parts/header';
import Routes from 'core/routes';

const App = () => {
    const canShowContent = Authorized();
    console.log('csc:'+ canShowContent);
    return (
        <I18nextProvider i18n={i18n}>
            <BrowserRouter>
                <div className="body-wrapper">
                    <Switch>
                        <Route exact path="/auth/callback" component={ AuthCallback } />
                        <Route exact path="/auth/silent" component={ AuthSilent } />
                        <Route exact path="/logout" component={ AuthLogout } />
                        <Route>
                            <Route component={ AuthDefault } />
                            { canShowContent ?
                                <>
                                    <div className="block-wrapper">
                                        <Route component={ Header } />
                                        <TopAlert />
                                        <Routes />
                                    </div>
                                    <Route component={ Footer } />
                                </> :
                                <Loader page />
                            }
                        </Route>
                    </Switch>
                </div>
                <Modal />

                <ScrollToTop />
            </BrowserRouter>
        </I18nextProvider>
    );
};

export default App;
