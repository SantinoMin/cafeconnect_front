import { Carousel } from "@material-tailwind/react";
import * as m from '../styles/StyledMain.tsx';
import * as s from '../styles/StyledStore.tsx';
import React, { useEffect, useState } from "react";
import {Input} from "@material-tailwind/react";
import {MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import axios from "axios";
import { url } from "../../config.js";

import { Map, MapMarker, useMap } from "react-kakao-maps-sdk";

const Store = () => {
    const [storeList, setStoreList] = useState([]);
    const [storeName, setStoreName] = useState("");
    const [isStore, setIsStore] = useState(false);
    const newArray = [];
    
    // 지도의 중심좌표
    const [center, setCenter] = useState({
        lat: 33.450701,
        lng: 126.570667,
    });

    // store와 지도 마커를 찍을 위치(위도, 경도)
    const [latlngPositions, setLatlngPositions] = useState([]);

    // 주소-좌표 변환 객체를 생성
    const geocoder = new window.kakao.maps.services.Geocoder();

    useEffect(()=>{
        setStoreList([]);
        getStoreList();
        // 1. 현재 위치 얻어오기
        navigator.geolocation.getCurrentPosition((pos) => {
            setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        });
    }, [])

    useEffect(()=>{
        if(isStore) {
            getLatLng();
            setIsStore(false);
        }
    }, [isStore])

    useEffect(()=>{
        console.log(latlngPositions);
    }, [latlngPositions])

    // 2. store address로 해당 위도, 경도로 바꾸기
    const getLatLng = ()=>{
        // 주소로 좌표를 검색 후 위도, 경도 저장
        storeList.forEach(function(store) {
            console.log(store);
            geocoder.addressSearch(store.storeAddress, function(result, status) {
                if (status === window.kakao.maps.services.Status.OK) {
                    var coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
                    console.log(coords);
                    
                    // 3. 위도 경도로 현재 위치에서 범위 안에 있는 store address만 가져오기
                    // 현재 위치와 store의 위치 사이의 거리를 구한다.
                    let dist = getDistanceFromLatLonInKm(center.lat, center.lng, coords.Ma, coords.La);
                    var coord = { lat: coords.Ma, lng: coords.La };
                    const arr = {"store":store, "coords":coord};
                    newArray.push({"store":store, "coords":coord});
                    console.log(newArray);
                    console.log(store.storeCode + " : " + dist);

                    // 모든 스토어의 변환이 끝났으면
                    if(storeList.length === newArray.length) {
                        setLatlngPositions(newArray);
                        console.log("end");
                    }
                }
            });
        });
    }

    const EventMarkerContainer = ({ position }) => {
        const map = useMap();
    
        return (
            <MapMarker // 현재 내 위치 마커 표시
                position={position.coords} // 마커를 표시할 위치
                clickable={true} // 마커 클릭 시 지도 클릭 이벤트 발생 안 하도록 설정
                title={position.store.storeName} // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시
            />
        )
      }

    // 두 좌표 사이의 거리를 km로 계산
    function getDistanceFromLatLonInKm(lat1,lng1,lat2,lng2) {//lat1:위도1, lng1:경도1, lat2:위도2, lat2:경도2
        function deg2rad(deg) {
            return deg * (Math.PI/180)
        }
        var R = 6371; // Radius of the earth in km
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lng2-lng1);
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in km
        return d; 
    }

    const getStoreList = (address)=>{
        axios.get(`${url}/allStoreList`)
        .then(res=>{
            console.log(res.data);
            setStoreList([...res.data]);
            setIsStore(true);
        })
        .catch(err=>{
            console.log(err);
        })
    }

    const searchKeyword = (storeName)=>{
        axios.get(`${url}/selectStoreByName/${storeName}`)
        .then(res=>{
            console.log(res.data);
            setStoreList([...res.data]);
            setIsStore(true);
        })
        .catch(err=>{
            console.log(err);
            alert("잠시후 다시 시도해주세요.");
        })
    }

    const bannerImages = [
        {
          id: 1,
          imageUrl: "/image/cafe1.jpg"
        },
        {
          id: 2,
          imageUrl: "/image/cafe2.jpg"
        },
        {
          id: 3,
          imageUrl: "/image/cafe3.jpg"
        }
    
      ];

    return (
        <>
            <m.CarouselDiv>
                <Carousel
                    autoplay={true}
                    autoplayDelay={4000}
                    loop={true}
                    navigation={({ setActiveIndex, activeIndex, length }) => (
                        <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
                          {new Array(length).fill("").map((_, i) => (
                            <span
                              key={i}
                              className={`block h-1 cursor-pointer rounded-2xl transition-all content-[''] ${activeIndex === i ? "w-8 bg-white" : "w-4 bg-white/50"
                                }`}
                              onClick={() => setActiveIndex(i)}
                            />
                          ))}
                        </div>
                    )}
                >
                    {/* 배너 이미지 */}
            {bannerImages.map((banner) => (
              <img key={banner.id}
                src={banner.imageUrl}
                alt="testing"
                className="w-full h-full object-cover"
              />
            ))}
                </Carousel>
            </m.CarouselDiv>
            
            <s.ContentDiv>
                <s.SearchDiv className="p-2">
                    <Input icon={<MagnifyingGlassIcon className="h-5 w-5" onClick={()=>searchKeyword(storeName)}/>} label="매장명 검색" onChange={(e)=>setStoreName(e.target.value)}/>
                </s.SearchDiv>
                <Map
                    center={center}
                    style={{ width: '1000px', height: '600px'}}
                    level={3}>

                    {// 4. 해당하는 store 마커로 보여주기
                        latlngPositions.map((position, index)=>(
                            <MapMarker // 현재 내 위치 마커 표시
                                key={index}
                                position={position.coords} // 마커를 표시할 위치
                                clickable={true} // 마커 클릭 시 지도 클릭 이벤트 발생 안 하도록 설정
                                title={position.store.storeName} // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시
                            />
                    ))}
                </Map>
            </s.ContentDiv>
        </>
    )
}
export default Store;