import React from 'react'
import HomeMovies from '../components/HomeMovies'
import HomeSports from '../components/HomeSports'
import HomeGeneralEvents from '../components/HomeGeneralEvents'
import Faq from '../components/Faq'
import HomeMainSlider from '../components/HomeMainSlider'
import HomeEventType from '../components/HomeEventType'
export default function HomePage() {
  return (
    <div className='min-h-screen'>
      <HomeMainSlider/>
      <HomeMovies />
      <HomeSports />
      <HomeGeneralEvents />
      <HomeEventType/>
      <Faq/>
    </div>

  )
}
