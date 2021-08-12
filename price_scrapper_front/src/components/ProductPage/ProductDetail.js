import React, { useEffect, useState } from "react";
import { Card } from 'react-bootstrap'
import { withRouter } from 'react-router';
import { Button, TextareaAutosize } from '@material-ui/core';
import './ProductDetail.css'
import SuggestedItems from '../SuggestedItems/SuggestedItems';
import { connect } from 'react-redux';
import axios from 'axios'
import StarRating from "./StarRating";
import qs from 'qs'
const ProductDetail = (props) => {
    const [index, setIndex] = useState(parseInt(props.match.params.index, 10));
    const [itemFromPath, setItemFromPath] = useState({})
    const [productInfoFromPath, setProductsFromPath] = useState([])
    const [showError, setShowError] = useState(false)
    var setProductIndex = (index) => {
        setIndex(index);
    }
    let divName = "columnNone";
    let bodyDivName = "cardDetailsBodyNone";
    let imgPadding = "25%";
    const [searchText, setSearchText] = useState("")
    var setProductIndex = (index) => {
        setIndex(index);
    }


    const [listReview, setListReview] = useState([]);
    var [rev, setReview] = useState("");
    const [loadedRating, setLoadedRating] = useState();



    useEffect(() => {
        let base64 = props.match.params.item64
        let jsonItem = atob(base64)
        let searchVariable = qs.parse(props.location.search)['?searchedWord']
        setSearchText(searchVariable)
        setItemFromPath(JSON.parse(jsonItem))
    }, [props.match.params.item64])


    useEffect(() => {
        if (props.items !== null || props.items !== undefined) {
            setProductsFromPath(props.items)
        }
    }, [props.items])



    function averagePrice() {
        var sum = 0;
        for (let i = 0; i < productInfoFromPath.length; i++) {
            sum = sum + parseInt(productInfoFromPath[i].price, 10);
        }
        return (sum / (productInfoFromPath.length + 1)).toFixed(2)

    }

    async function addReview() {
        if (rev !== "") {
            setShowError(false)
            try {
                let token = localStorage.getItem("token");
                if (token === "" || token === null || token === undefined) return;
                const resp = await axios.get('/api/user/userinfo', {
                    headers: {
                        "Authorization": token
                    }
                })
                const data = await resp.data
                var FirstName = data.Name;
                var itemURL = itemFromPath.itemURL;
                var title = itemFromPath.title;
                var LastName = itemFromPath.LastName;
                var review = rev;
                var newReview = {
                    itemURL,
                    title,
                    FirstName,
                    LastName,
                    review
                };
                await axios.post('/api/items/sendReviews', newReview, {
                    headers: {
                        "Authorization": token
                    }
                })
                setListReview(prev => [...prev, newReview])
                setReview("")
            } catch (e) {
                console.log(e.message)
            }
        } else {
            setShowError(true)
        }
    }

    async function getReview() {
        try {
            let token = localStorage.getItem("token");
            const resp = await axios.post('/api/items/getReviews', { itemURL: itemFromPath.itemURL }, {
                headers: {
                    "Authorization": token
                }
            })
            const data = await resp.data
            if (data.length > 0) {
                setListReview(data)
            } else {
                setListReview([])
            }
        } catch (e) {
            console.log(e.message)
        }
    }

    async function getRating() {
        try {
            let token = localStorage.getItem("token");
            const resp = await axios.get(`/api/items/getRating/${itemFromPath.title}`, {
                headers: {
                    "Authorization": token
                }
            })
            const data = await resp.data
            console.log(data)
            setLoadedRating(data)
        } catch (e) {
            console.log(e.message)
        }
    }



    useEffect(() => {
        getRating()
        getReview()
    }, [itemFromPath])


    // var callAmazonAPI = async () => {
    //     try {
    //         console.log(searchText);
    //         var amazonResponse = await axios.post("/api/amazon/search", { searchText, startPoint:1, sortVariable:'Highest Rating' });
    //         const amazonJSON = await amazonResponse.data;
    //         const amazonItemArr = await amazonJSON.result;
    //         console.log("this is amazon" + amazonItemArr);
    //     } catch (e) {
    //         console.log(e.response.data.error.message);

    //     }

    // };



    // var callEbayAPI = async () => {
    //     try {
    //         var ebayResponse = await axios.post("/api/ebay/search", { searchText, startPoint:1, sortVariable:'Highest Rating' });
    //         const ebayJSON = await ebayResponse.data;
    //         const ebayItemArr = await ebayJSON.result;
    //     } catch (e) {
    //         console.log(e);

    //     }

    // };


    function addToWishlist() {
        let token = localStorage.getItem("token")
        delete itemFromPath["_id"]
        axios.post('/api/items/addToWishList', { item: itemFromPath }, {
            headers: {
                "Authorization": token
            }
        })
            .then(response => console.log(response.data));
    }

    useEffect(() => {
        if (props.item.title === "" && itemFromPath === null) props.history.push("/")
        else {

        }
    }, [])


    return (
        <div className="cardInfo">
            {
                localStorage.getItem("token") ? (
                    divName = "column",
                    bodyDivName = "cardDetailsBody",
                    imgPadding = "33%"
                ) : (
                    divName = "columnNone",
                    bodyDivName = "cardDetailsBodyNone",
                    imgPadding = "25%"
                )
            }
            <div className="cardContents">
                <Card style={{ height: '500px' }} id="cardDetail">
                    <div className="row">
                        <div className={divName}>
                            <Card.Img style={{ paddingTop: imgPadding }} variant="top" src={itemFromPath.image} width='300' height='200' />
                            <br />
                            <br />
                            <Card.Title className="cardDetailsTitle">{itemFromPath.title}</Card.Title>
                        </div>
                        <div className={divName}>
                            <Card.Body className={bodyDivName}>
                                <div>
                                    <p>
                                        Vendor: {itemFromPath.vendor}
                                    </p>
                                    <p>
                                        Price: {itemFromPath.price} {itemFromPath.currency}
                                    </p>
                                    {
                                        localStorage.getItem("token") ? <p>Rating: {loadedRating === "NaN" ? "Not available" : loadedRating}</p> : null
                                    }
                                    <p>
                                        Average Price: {averagePrice()}
                                    </p>
                                    <br />
                                    <br />
                                    <br />
                                    <a href={itemFromPath.itemURL}>
                                        <Button id="buyBtn" variant="contained" color="primary">
                                            Buy product!
                                        </Button>
                                    </a>
                                    <br />
                                    <br />
                                    {
                                        localStorage.getItem("token") ?
                                            <Button variant="contained" color="primary" onClick={() => { addToWishlist() }}>
                                                Add to wishlist
                                            </Button> : null
                                    }
                                </div>
                            </Card.Body>
                        </div>
                        {
                            localStorage.getItem("token") ?
                                <div className="column">
                                    <div id="reviews">
                                        <StarRating itemFromPath={itemFromPath} />
                                        <h3>Reviews</h3>
                                        {
                                            listReview.length !== 0 ?
                                                <div id="reviewList">
                                                    {listReview.map((item, idx) => (
                                                        <p key={idx}> {item.FirstName}: {item.review}</p>))}
                                                </div>
                                                : <p id="emptyText"> No reviews available yet, write one!</p>
                                        }
                                        <br />
                                        <br />
                                        <TextareaAutosize data-role="none" style={{ resize: "none" }} id="textArea" value={rev} rows={4} placeholder="Write a review" onChange={e => setReview(e.target.value)}></TextareaAutosize>
                                        <br />
                                        <br />
                                        <Button variant="contained" color="primary" onClick={() => addReview()}>Submit Review</Button>
                                        {
                                            showError ? <p id="errorText"> Please submit a review.</p> : null
                                        }
                                    </div>
                                </div> : null
                        }
                    </div>
                </Card>
            </div>
            <SuggestedItems
                allItems={productInfoFromPath} setProductIndex={setProductIndex}
            />
        </div>
    )
}


const mapToState = state => {
    return {
        item: state.item,
        items: state.items
    }
}

export default connect(mapToState, null)(withRouter(ProductDetail));



