import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Sparklines, SparklinesLine } from 'react-sparklines';
import { recordAdsView } from 'app/utils/ServerApiClient';

class Coin extends Component {
    constructor(props) {
        super(props);
        this.onPointMouseMove = this.onPointMouseMove.bind(this);
        this.onPointMouseOut = this.onPointMouseOut.bind(this);
        this.setRecordAdsView = this.setRecordAdsView.bind(this);
    }

    componentDidMount() {
        const node = ReactDOM.findDOMNode(this.refs.coin);
        node.querySelectorAll('circle').forEach(circle => {
            circle.setAttribute('r', '8');
            circle.style.fillOpacity = 0;
            circle.style.cursor = 'pointer';
            circle.addEventListener('mouseover', this.onPointMouseMove);
        });
        node.querySelectorAll('polyline').forEach(circle => {
            circle.style.pointerEvents = 'none';
        });
        node.addEventListener('mouseout', this.onPointMouseOut);
    }

    componentWillUnmount() {
        const node = ReactDOM.findDOMNode(this.refs.coin);
        node.querySelectorAll('circle').forEach(circle => {
            circle.removeEventListener('mouseover', this.onPointMouseMove);
        });
        node.removeEventListener('mouseout', this.onPointMouseOut);
    }

    setRecordAdsView() {
        const { trackingId, page } = this.props;
        recordAdsView({
            trackingId,
            adTag: page,
        });
    }

    render() {
        const color = this.props.color;
        const coin = this.props.coin;
        const name = coin.get('name');
        const symbol = coin.get('symbol');
        const timepoints = coin.get('timepoints');
        const priceUsd = timepoints.last().get('price_usd');
        const pricesUsd = timepoints
            .map(point => parseFloat(point.get('price_usd')))
            .toJS();

        let url = '';

        switch (symbol) {
            case 'STEEM':
                url = 'https://poloniex.com/exchange#trx_steem';
                break;
            case 'BTC':
                url = 'https://poloniex.com/exchange#usdt_btc';
                break;
            case 'ETH':
                url = 'https://poloniex.com/exchange#usdt_eth';
                break;
            case 'SBD':
                url = '';
                break;
            case 'TRX':
                url = 'https://poloniex.com/exchange#usdt_trx';
                break;
            case 'JST':
                url = 'https://poloniex.com/exchange#trx_jst';
                break;
            default:
                url = '';
        }
        return (
            <div
                ref="coin"
                className="coin"
                style={{ display: `${symbol === 'XRP' ? 'none' : 'block'}` }}
            >
                {url ? (
                    <a
                        href={url}
                        target="_blank"
                        onClick={this.setRecordAdsView}
                    >
                        <div className="chart">
                            <Sparklines data={pricesUsd}>
                                <SparklinesLine
                                    color={color}
                                    style={{ strokeWidth: 3.0 }}
                                    onMouseMove={e => {
                                        console.log(e);
                                    }}
                                />
                            </Sparklines>
                            <div className="caption" />
                        </div>
                    </a>
                ) : (
                    <div className="chart">
                        <Sparklines data={pricesUsd}>
                            <SparklinesLine
                                color={color}
                                style={{ strokeWidth: 3.0 }}
                                onMouseMove={e => {
                                    console.log(e);
                                }}
                            />
                        </Sparklines>
                        <div className="caption" />
                    </div>
                )}
                <div className="coin-label">
                    <span className="symbol">{symbol}</span>{' '}
                    <span className="price">
                        {parseFloat(priceUsd).toFixed(symbol === 'JST' ? 3 : 2)}
                    </span>
                </div>
            </div>
        );
    }

    onPointMouseMove(e) {
        const node = ReactDOM.findDOMNode(this.refs.coin);
        const caption = node.querySelector('.caption');
        const circle = e.currentTarget;
        const circles = node.querySelectorAll('circle');
        const index = Array.prototype.indexOf.call(circles, circle);
        const points = this.props.coin.get('timepoints');
        const point = points.get(index);
        const priceUsd = parseFloat(point.get('price_usd')).toFixed(2);
        const timepoint = point.get('timepoint');
        const time = new Date(timepoint).toLocaleString();
        caption.innerText = `$${priceUsd} ${time}`;
    }

    onPointMouseOut(e) {
        const node = ReactDOM.findDOMNode(this.refs.coin);
        const caption = node.querySelector('.caption');
        caption.innerText = '';
    }
}

class SteemMarket extends Component {
    render() {
        const steemMarketData = this.props.steemMarketData;
        if (steemMarketData.isEmpty()) {
            return null;
        }
        const topCoins = steemMarketData.get('top_coins');
        const steem = steemMarketData.get('steem');
        const sbd = steemMarketData.get('sbd');
        const tron = steemMarketData.get('tron');
        const jst = steemMarketData.get('jst');
        const { trackingId, page } = this.props;

        return (
            <div className="c-sidebar__module">
                <div className="c-sidebar__header">
                    <h3 className="c-sidebar__h3">Coin Marketplace</h3>
                </div>
                <div className="c-sidebar__content">
                    <div className="steem-market">
                        <Coin
                            coin={steem}
                            color="#09d6a8"
                            trackingId={trackingId}
                            page={page}
                        />
                        <Coin
                            coin={tron}
                            color="#788187"
                            trackingId={trackingId}
                            page={page}
                        />
                        {jst && (
                            <Coin
                                coin={jst}
                                color="#788187"
                                trackingId={trackingId}
                                page={page}
                            />
                        )}
                        {topCoins.map(coin => (
                            <Coin
                                key={coin.get('name')}
                                coin={coin}
                                color="#788187"
                                trackingId={trackingId}
                                page={page}
                            />
                        ))}
                        <Coin
                            coin={sbd}
                            color="#09d6a8"
                            trackingId={trackingId}
                            page={page}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const steemMarketData = state.app.get('steemMarket');
        const trackingId = state.app.get('trackingId');
        return {
            ...ownProps,
            steemMarketData,
            trackingId,
        };
    },
    // mapDispatchToProps
    dispatch => ({})
)(SteemMarket);
