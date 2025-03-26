"use client"
import React from "react";
import { usePathname } from 'next/navigation'
function Room() {
    const roomId = usePathname().split("/room/")[1];
    console.log(roomId)
  return (
    <>
      <h1>Room {roomId}</h1>
    </>
  );
}

export default Room;
