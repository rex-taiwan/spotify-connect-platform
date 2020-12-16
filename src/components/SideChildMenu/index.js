import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
  useMemo,
  useLayoutEffect,
} from "react"
import { Flipper, Flipped, spring } from "react-flip-toolkit"
import axios from "axios"
import {
  Link,
  BrowserRouter,
  useHistory,
  useParams,
  useLocation,
} from "react-router-dom"
import ColorThief from "colorthief"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPlay,
  faPause,
  faChartBar,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons"
import { PlaylistContext } from "../../context/playlist"
import { PlayerContext } from "../../context/player"
import { AuthContext } from "../../context/auth"
import { millisToMinutesAndSeconds } from "../../utils/utils"
import { SoundEqualizer } from "../../components/SoundEqualizer"

import "./styles/styles.scss"

export const SideChildMenu = (props) => {
  const { sidePlayListData, top50TracksList, viral50TracksList } = useContext(
    PlaylistContext
  )
  const { globalState, playFn } = useContext(PlayerContext)
  const sideMenuRef = useRef(null)
  const { getToken } = useContext(AuthContext)
  let history = useHistory()
  let location = useLocation()
  const [showInfo, setShowInfo] = useState({})
  const [sideMenuBackground, setSideMenuBackground] = useState("")
  const [relatedArtists, setRelatedArtists] = useState([])
  const [artistInfo, setArtistInfo] = useState({})
  const [artistTopTracks, setArtistTopTracks] = useState([])

  const getSingleShowDes = (validateToken, id) => {
    const url = `https://api.spotify.com/v1/shows/${id}`
    axios
      .get(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validateToken}`,
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
      .then(function (response) {
        setShowInfo(response.data)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const getRelatedArtists = (validateToken, id) => {
    const url = `https://api.spotify.com/v1/artists/${id}/related-artists`
    axios
      .get(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validateToken}`,
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
      .then(function (response) {
        setRelatedArtists(response.data.artists)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const getSingleAlbumDes = (validateToken, id) => {
    const url = `https://api.spotify.com/v1/albums/${id}`
    axios
      .get(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validateToken}`,
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
      .then(function (response) {
        getArtistInfo(validateToken, response.data.artists[0].id)
        getArtistTopTracks(validateToken, response.data.artists[0].id)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  const getArtistInfo = (validateToken, id) => {
    const url = `https://api.spotify.com/v1/artists/${id}`
    axios
      .get(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validateToken}`,
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
      .then(function (response) {
        console.log(response, "artistinof")
        setArtistInfo(response.data)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  async function getArtistTopTracks(validateToken, artistId) {
    const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=TW`
    axios
      .get(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${validateToken}`,
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
      })
      .then(function (response) {
        setArtistTopTracks(response.data.tracks)
      })
      .catch((err) => {
        // Handle Error Here
        console.error(err)
      })
  }

  useEffect(() => {
    if (getToken()) {
      var pararm_id = location.pathname.substring(
        location.pathname.lastIndexOf("/") + 1
      )
      getSingleShowDes(getToken(), pararm_id)
      getSingleAlbumDes(getToken(), pararm_id)
      getRelatedArtists(getToken(), pararm_id)
    }
  }, [getToken(), location.pathname])

  useEffect(() => {
    const rgbToHex = (r, g, b) =>
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16)
          return hex.length === 1 ? "0" + hex : hex
        })
        .join("")
    if (artistInfo && artistInfo.images) {
      const colorThief = new ColorThief()
      const img = sideMenuRef.current
      img.onload = () => {
        const result = colorThief.getColor(img)
        rgbToHex(result[0], result[1], result[2])
        setSideMenuBackground(rgbToHex(result[0], result[1], result[2]))
      }
      const rgbToHex = (r, g, b) =>
        "#" +
        [r, g, b]
          .map((x) => {
            const hex = x.toString(16)
            return hex.length === 1 ? "0" + hex : hex
          })
          .join("")
    }
  }, [artistInfo])

  const sideContentCondition = () => {
    if (
      location.pathname.includes("artist") &&
      location.pathname !== "/collection/artists"
    ) {
      return (
        <>
          <div class="side-chart__wrap side-chart__nav pl-3">
            <ul class="nav">
              <li class="nav__list">
                <p class="title is-5">Fans also like</p>
              </li>
            </ul>
          </div>
          <div class="side-chart__wrap side-chart__contents mt-4">
            {relatedArtists.map((item, index) => {
              return (
                <div class="side-chart__item container mt-2">
                  <div key={index} class="columns is-variable is-2 is-mobile">
                    <div
                      class="column is-2 has-text-right"
                      style={{
                        border: `${1}px solid rgba(213, 213, 213, 0.5)`,
                        margin: "auto",
                        backgroundSize: "cover",
                        borderRadius: 50,
                        height: 40,
                        width: 40,
                        marginRight: "auto",
                        backgroundImage: `url(${item && item.images[0].url})`,
                      }}
                    ></div>

                    <div class="column is-8" style={{ margin: "auto" }}>
                      <p
                        class="subtitle is-7 has-text-black truncate"
                        style={{ width: 150 }}
                      >
                        {item && item.name}
                        <br />
                      </p>
                    </div>
                    <div class="column is-2" style={{ margin: "auto" }}>
                      <button
                        class="button is-small side-chart__item__play__duration is-text"
                        style={{ textDecoration: "none" }}
                      >
                        {/* {millisToMinutesAndSeconds(item.duration_ms)} */}
                      </button>

                      <button class="button is-small side-chart__item__play__button">
                        <FontAwesomeIcon icon={faPlay} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )
    } else if (
      location.pathname.includes("album") &&
      location.pathname !== "/collection/albums"
    ) {
      return (
        <div class="main__wrap summary" style={{ background: "transparent" }}>
          <div
            class="summary__bg"
            style={{
              background: `linear-gradient(
              to bottom,
              rgba(243, 121, 221, 0),
              rgba(28, 29, 29, 0.9)
              ),
            url(${
              artistInfo && artistInfo.images && artistInfo.images[0].url
            })`,
              height: 290,
            }}
          ></div>
          <div class="summary__box" style={{ position: "relative" }}>
            <div
              class="summary__text"
              style={{ width: 200, bottom: 0, position: "absolute" }}
            >
              <ul>
                <li>
                  <strong class="summary__text--title title is-4 has-text-white">
                    {artistInfo && artistInfo.name}
                  </strong>
                </li>
                <li>
                  <button class="button is-light is-small is-rounded mt-2">
                    View Artist
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div
            class="side-chart__wrap side-chart__contents"
            style={{ marginTop: 270, height: 400, padding: 10 }}
          >
            <img
              crossOrigin={"anonymous"}
              ref={sideMenuRef}
              src={artistInfo && artistInfo.images && artistInfo.images[0].url}
              alt=""
              class="is-hidden"
            />
            <p class="title is-5" style={{ marginLeft: -10 }}>
              More by {artistInfo && artistInfo.name}
            </p>
            {artistTopTracks.map((item, index) => {
              return (
                <div
                  class="side-chart__item container mt-2"
                  style={{ opacity: 1 }}
                >
                  <div key={index} class="columns is-variable is-2 is-mobile">
                    <div
                      class="column is-2 has-text-right"
                      style={{
                        border: `${1}px solid rgba(213, 213, 213, 0.5)`,
                        margin: "auto",
                        backgroundSize: "cover",
                        height: 40,
                        width: 40,
                        marginRight: "auto",
                        backgroundImage: `url(${
                          item && item.album.images[0].url
                        })`,
                      }}
                    ></div>

                    <div class="column is-8" style={{ margin: "auto" }}>
                      <p
                        class="subtitle is-7 has-text-black truncate"
                        style={{ width: 150 }}
                      >
                        {item && item.album.name}
                        <br />
                      </p>
                    </div>
                    <div class="column is-2" style={{ margin: "auto" }}>
                      <button
                        class="button is-small side-chart__item__play__duration is-text"
                        style={{ textDecoration: "none" }}
                      >
                        {/* {millisToMinutesAndSeconds(item.duration_ms)} */}
                      </button>

                      <button class="button is-small side-chart__item__play__button">
                        <FontAwesomeIcon icon={faPlay} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    } else {
      return (
        <>
          <div class="side-chart__wrap side-chart__nav pl-3">
            <ul class="nav">
              {/* <li class="nav__list pl-0">
                <p class="title is-5">Charts</p>
              </li> */}
            </ul>
          </div>
          <div class="side-chart__wrap side-chart__contents">
            <TabsGroup />
          </div>
        </>
      )
    }
  }

  return (
    <div>
      <div class="side-chart is-hidden-touch">{sideContentCondition()}</div>
    </div>
  )
}

const Tabs = (props) => {
  const [selected, setSelected] = useState(props.selected || 0)
  function handleChange(index) {
    setSelected(index)
  }

  return (
    <div>
      <div className="tabs mt-2">
        <ul>
          {props.children.map((elem, index) => {
            let style = index == selected ? "is-active" : ""
            return (
              <li
                className={style}
                key={index}
                onClick={() => {
                  handleChange(index)
                }}
              >
                <a class="has-text-grey title is-7">{elem.props.title}</a>
              </li>
            )
          })}
        </ul>
      </div>
      <div className="content">{props.children[selected]}</div>
    </div>
  )
}

const TabsGroup = (props) => {
  const { sidePlayListData, top50TracksList, viral50TracksList } = useContext(
    PlaylistContext
  )

  return (
    <Tabs selected={0}>
      <TabsContent title="Popular">
        {top50TracksList.map((item, index) => {
          return (
            <div class="side-chart__item container mt-2">
              <div key={index} class="columns is-variable is-2 is-mobile">
                <div
                  class="column is-2 has-text-right"
                  style={{
                    border: `${1}px solid rgba(213, 213, 213, 0.5)`,
                    margin: "auto",
                    backgroundSize: "cover",
                    borderRadius: 2,
                    height: 40,
                    width: 40,
                    marginRight: "auto",
                    backgroundImage: `url(${
                      item.track && item.track.album.images[0].url
                    })`,
                  }}
                ></div>

                <div class="column is-8">
                  <div class="columns">
                    <div class="column is-2 has-text-right">
                      <span class="has-text-grey title is-7">{index + 1}</span>
                    </div>
                    <div class="column is-10">
                      <p
                        class="subtitle is-7 has-text-black truncate"
                        style={{ width: 150 }}
                      >
                        {item.track && item.track.name}
                        <br />
                        <span class="has-text-grey">
                          {item.track.artists[0].name}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div class="column is-2" style={{ margin: "auto" }}>
                  <button
                    class="button is-small side-chart__item__play__duration is-text"
                    style={{ textDecoration: "none" }}
                  >
                    {millisToMinutesAndSeconds(item.track.duration_ms)}
                  </button>

                  <button class="button is-small side-chart__item__play__button">
                    <FontAwesomeIcon icon={faPlay} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </TabsContent>
      <TabsContent title="Viral">
        {viral50TracksList.map((item, index) => {
          return (
            <div class="side-chart__item container mt-2">
              <div key={index} class="columns is-variable is-2 is-mobile">
                <div
                  class="column is-2 has-text-right"
                  style={{
                    border: `${1}px solid rgba(213, 213, 213, 0.5)`,
                    margin: "auto",
                    backgroundSize: "cover",
                    borderRadius: 2,
                    height: 40,
                    width: 40,
                    marginRight: "auto",
                    backgroundImage: `url(${
                      item.track && item.track.album.images[0].url
                    })`,
                  }}
                ></div>

                <div class="column is-8">
                  <div class="columns">
                    <div class="column is-2 has-text-right">
                      <span class="has-text-grey title is-7">{index + 1}</span>
                    </div>
                    <div class="column is-10">
                      <p
                        class="subtitle is-7 has-text-black truncate"
                        style={{ width: 150 }}
                      >
                        {item.track && item.track.name}
                        <br />
                        <span class="has-text-grey">
                          {item.track.artists[0].name}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div class="column is-2" style={{ margin: "auto" }}>
                  <button
                    class="button is-small side-chart__item__play__duration is-text"
                    style={{ textDecoration: "none" }}
                  >
                    {millisToMinutesAndSeconds(item.track.duration_ms)}
                  </button>

                  <button class="button is-small side-chart__item__play__button">
                    <FontAwesomeIcon icon={faPlay} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </TabsContent>
    </Tabs>
  )
}

const TabsContent = (props) => {
  return <div>{props.children}</div>
}
