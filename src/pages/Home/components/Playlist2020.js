import React, { useRef, useState, useEffect, useContext } from "react"
import debounce from "lodash.debounce"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons"
import { Link, BrowserRouter, useHistory } from "react-router-dom"
import axios from "axios"

import { PlaylistContext } from "../../../context/playlist"
import { PlayerContext } from "../../../context/player"
import { AuthContext } from "../../../context/auth"

function usePrevious(value) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const urlDetection = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.replace(urlRegex, function (url) {
    return '<a class="omg" href="' + url + '">' + url + "</a>"
  })
}

const Playlist2020 = (props) => {
  let history = useHistory()
  const { playFn, globalState, pauseFn } = useContext(PlayerContext)
  const { featuredPlaylistsData } = useContext(PlaylistContext)
  const { getToken } = useContext(AuthContext)
  const container = useRef(null)
  const [state, setstate] = useState({
    hasOverflow: false,
    canScrollLeft: false,
    canScrollRight: false,
  })

  const [userTop2020Songs, setUserTop2020Songs] = useState({})
  const [userMissHitSongs, setUserMissHitSongs] = useState({})

  const getUserTop2020Playlist = (validateToken, id) => {
    const url = `https://api.spotify.com/v1/playlists/${id}`
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
        setUserTop2020Songs(response.data)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const getUserMissedHitsPlaylist = (validateToken, id) => {
    const url = `https://api.spotify.com/v1/playlists/${id}`
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
        setUserMissHitSongs(response.data)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  useEffect(() => {
    getUserTop2020Playlist(getToken(), "37i9dQZF1EMc4fdopPFnaO")
    getUserMissedHitsPlaylist(getToken(), "37i9dQZF1EO91j1ytS1iRc")
  }, [getToken()])

  const checkForScrollPosition = () => {
    const { scrollLeft, scrollWidth, clientWidth } = container.current

    setstate({
      canScrollLeft: scrollLeft > 0,
      canScrollRight: scrollLeft !== scrollWidth - clientWidth,
    })
  }

  const checkForOverflow = () => {
    const { scrollWidth, clientWidth } = container.current
    // const hasOverflow = scrollWidth > clientWidth
    setstate({ hasOverflow: scrollWidth > clientWidth })
  }

  const debounceCheckForOverflow = debounce(checkForOverflow, 1000)
  const debounceCheckForScrollPosition = debounce(checkForScrollPosition, 200)

  const scrollContainerBy = (distance) => {
    container.current.scrollBy({ left: distance, behavior: "smooth" })
  }

  const buildItems = () => {
    return (
      userTop2020Songs &&
      userMissHitSongs &&
      [userTop2020Songs, userMissHitSongs].map((item, index) => {
        return (
          <li
            class="hs__item"
            key={index}
            onClick={() => {
              history.push(`/playlist/${item.id}`)
            }}
          >
            <div class="hs__item__image__wrapper">
              <img
                class="hs__item__image"
                src={item && item.images && item.images[0].url}
                alt=""
              />
            </div>
            <div class="hs__item__description">
              <span class="hs__item__title has-text-black">{item.name}</span>
              <div
                className="subtitle is-7 has-text-grey"
                style={{
                  letterSpacing: 1,
                  lineHeight: 1.2,
                }}
                dangerouslySetInnerHTML={{
                  __html: urlDetection(
                    (item &&
                      item.description &&
                      item.description.replace(/\n/g, "")) ||
                      ""
                  ),
                }}
              />
            </div>
            <div class="hs__item__play__button">
              <a
                href="javascript:void(0)"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                {globalState &&
                globalState.isPlaying &&
                globalState.contextUrl &&
                globalState.contextUrl.includes(item && item.uri) ? (
                  <button
                    class="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      pauseFn(getToken())
                    }}
                  >
                    <FontAwesomeIcon icon={faPause} />
                  </button>
                ) : (
                  <button
                    class="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      playFn(
                        getToken(),
                        globalState.currentDeviceId,
                        "",
                        "",
                        item.uri
                      )
                    }}
                  >
                    <FontAwesomeIcon icon={faPlay} />
                  </button>
                )}
              </a>
            </div>
          </li>
        )
      })
    )
  }

  const buildControls = () => {
    const { canScrollLeft, canScrollRight } = state
    return (
      <>
        <div class="hs__arrows">
          <button
            class={
              !canScrollLeft ? "arrow arrow-prev disabled" : "arrow arrow-prev"
            }
            type="button"
            disabled={!canScrollLeft}
            onClick={() => {
              scrollContainerBy(-200)
            }}
          ></button>

          <button
            class={
              !canScrollRight ? "arrow arrow-next disabled" : "arrow arrow-next"
            }
            type="button"
            disabled={!canScrollRight}
            onClick={() => {
              scrollContainerBy(200)
            }}
          ></button>
        </div>
      </>
    )
  }

  useEffect(() => {
    checkForOverflow()
    checkForScrollPosition()
    container.current.addEventListener("scroll", debounceCheckForScrollPosition)
    return (
      () =>
        container.current.removeEventListener(
          "scroll",
          debounceCheckForScrollPosition
        ),
      debounceCheckForOverflow.cancel()
    )
  }, [])
  const prevState = usePrevious(featuredPlaylistsData)

  useEffect(() => {
    if (undefined !== prevState && featuredPlaylistsData.length) {
      if (prevState.length !== featuredPlaylistsData.length) {
        checkForOverflow()
        checkForScrollPosition()
      }
    }
  }, [prevState, featuredPlaylistsData])

  return (
    <div>
      <div class="hs__header">
        <h2 class="hs__headline has-text-black">
          <div class="title is-5">Your 2020 Wrapped</div>
        </h2>
      </div>
      <ul className="hs item-container" ref={container}>
        {buildItems()}
      </ul>
    </div>
  )
}

export default Playlist2020
