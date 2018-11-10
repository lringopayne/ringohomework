#Dependencies
from bs4 import BeautifulSoup
import requests
from splinter import Browser
from splinter.exceptions import ElementDoesNotExist
import pandas as pd 
import time

def init_browser():
    executable_path = {'executable_path':'C:/Users/lsrin/Desktop/chromedriver.exe'}
    return Browser('chrome', **executable_path, headless=False)


def scrape():
    browser = init_browser()

    # Create a dictionary for all of the scraped data
    marsdata = {}

    # Visit the Mars news page. 
    url = "https://mars.nasa.gov/news/"
    browser.visit(url)
    time.sleep(4)

    #Scrape the page into soup and Search News
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')
    
    search = soup.select_one("li.slide")

    # Mars News
    news_title = search.find("div", class_="content_title").get_text()
    news_p = search.find("div", class_="article_teaser_body").get_text()

    # Add the news title and paragraph to the dictionary
    marsdata["news_title"] = news_title
    marsdata["summary"] = news_p

    # JPL Mars Space Images - Featured Image
    url2 = "https://www.jpl.nasa.gov/spaceimages/?search=&category=Mars"
    browser.visit(url2)
    time.sleep(4)
    fullimage = browser.find_by_id("full_image")
    fullimage.click()
    time.sleep(4)

    # Scrape the browser into soup and use soup to find the image of mars
    # Save the image url to a variable called `img_url`
    html2 = browser.html
    soup = BeautifulSoup(html2, 'html.parser')
    image = soup.find("img", class_="fancybox-image")["src"]
    img_url = "https://jpl.nasa.gov"+image
    featured_image_url = img_url

    # Add the featured image url to the dictionary
    marsdata["featured_image_url"] = featured_image_url

    # Mars Weather
    url3 = "https://twitter.com/marswxreport?lang=en"
    browser.visit(url3)
    time.sleep(4)
    html_weather = browser.html
    
    soup3 = BeautifulSoup(html_weather, 'html.parser')
    mars_weather = soup3.find("p", class_="TweetTextSize TweetTextSize--normal js-tweet-text tweet-text").text

    # Add the mars weather to the dictionary
    marsdata["mars_weather"] = mars_weather

    # Mars Facts
    url4 = "https://space-facts.com/mars/"

    # Use Pandas to convert the data to a HTML table string
    table = pd.read_html(url4)
    df_marsfacts = pd.DataFrame(table[0])
    df_marsfacts.columns = ["Parameter", "Values"]
    df_marsfacts.set_index(["Parameter"])

    # Html Table String
    marshtml_table = df_marsfacts.to_html()
    marshtml_table = marshtml_table.replace("\n", "")
    
    
    # Add the Mars facts table to the dictionary
    marsdata["marshtml_table"] = marshtml_table


    # Visit the USGS Astogeology site and scrape pictures of the hemispheres
    url5 = "https://astrogeology.usgs.gov/search/results?q=hemisphere+enhanced&k1=target&v1=Mars"
    browser.visit(url5)
    time.sleep(4)
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')
    mars_hemis=[]

    for i in range (4):
        time.sleep(5)
        images = browser.find_by_tag('h3')
        images[i].click()
        html = browser.html
        soup = BeautifulSoup(html, 'html.parser')
        partial = soup.find("img", class_="wide-image")["src"]
        img_title = soup.find("h2",class_="title").text
        img_url = 'https://astrogeology.usgs.gov'+ partial
        dictionary={"title":img_title,"img_url":img_url}
        mars_hemis.append(dictionary)
        browser.back()

    marsdata['mars_hemis'] = mars_hemis
    # Return the dictionary
    return marsdata

 