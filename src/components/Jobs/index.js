import {Component} from 'react'
import Cookies from 'js-cookie'
import {BsSearch} from 'react-icons/bs'

import Header from '../Header'
import ProfileDetails from '../ProfileDetails'
import FiltersGroup from '../FiltersGroup'
import JobCard from '../JobCard'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Jobs extends Component {
  state = {
    profileDetails: {},
    profileApiStatus: apiStatusConstants.initial,
    jobsList: [],
    jobsApiStatus: apiStatusConstants.initial,
    searchInput: '',
    activeSalaryRangeId: '',
    employmentTypesChecked: [],
    locationsChecked: [], // Added for location filter
  }

  componentDidMount() {
    this.getProfileDetails()
    this.getJobs()
  }

  updateEmploymentTypesChecked = typeId => {
    const {employmentTypesChecked} = this.state
    let updatedList = employmentTypesChecked
    if (employmentTypesChecked.includes(typeId)) {
      updatedList = employmentTypesChecked.filter(
        eachType => eachType !== typeId,
      )
    } else {
      updatedList = [...updatedList, typeId]
    }

    this.setState({employmentTypesChecked: updatedList}, this.getJobs)
  }

  updateSalaryRangeId = activeSalaryRangeId =>
    this.setState({activeSalaryRangeId}, this.getJobs)

  // Added for location filter
  updateLocationsChecked = locationId => {
    const {locationsChecked} = this.state
    let updatedList = locationsChecked
    if (locationsChecked.includes(locationId)) {
      updatedList = locationsChecked.filter(
        eachLocation => eachLocation !== locationId,
      )
    } else {
      updatedList = [...updatedList, locationId]
    }

    this.setState({locationsChecked: updatedList}, this.filterJobsByLocation)
  }

  // Added for location filter
  filterJobsByLocation = () => {
    const {jobsList: allJobs, locationsChecked} = this.state
    
    if (locationsChecked.length === 0) {
      this.setState({filteredJobsList: allJobs})
      return
    }

    const filteredJobs = allJobs.filter(job =>
      locationsChecked.includes(job.location.toUpperCase()),
    )
    this.setState({filteredJobsList: filteredJobs})
  }

  getJobs = async () => {
    this.setState({jobsApiStatus: apiStatusConstants.inProgress})

    const {activeSalaryRangeId, employmentTypesChecked, searchInput} =
      this.state

    const employTypes = employmentTypesChecked.join(',')
    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = `https://apis.ccbp.in/jobs?employment_type=${employTypes}&minimum_package=${activeSalaryRangeId}&search=${searchInput}`

    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    const data = await response.json()
    if (response.ok === true) {
      const {jobs} = data
      const updatedData = jobs.map(eachJob => ({
        companyLogoUrl: eachJob.company_logo_url,
        employmentType: eachJob.employment_type,
        id: eachJob.id,
        jobDescription: eachJob.job_description,
        location: eachJob.location,
        packagePerAnnum: eachJob.package_per_annum,
        rating: eachJob.rating,
        title: eachJob.title,
      }))
      this.setState({
        jobsList: updatedData,
        filteredJobsList: updatedData, // Initialize filtered list with all jobs
        jobsApiStatus: apiStatusConstants.success,
      }, this.filterJobsByLocation)
    } else {
      this.setState({jobsApiStatus: apiStatusConstants.failure})
    }
  }

  getProfileDetails = async () => {
    this.setState({profileApiStatus: apiStatusConstants.inProgress})

    const jwtToken = Cookies.get('jwt_token')
    const apiUrl = 'https://apis.ccbp.in/profile'
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    const data = await response.json()
    if (response.ok === true) {
      const profileDetails = data.profile_details
      const updatedData = {
        name: profileDetails.name,
        profileImageUrl: profileDetails.profile_image_url,
        shortBio: profileDetails.short_bio,
      }
      this.setState({
        profileDetails: updatedData,
        profileApiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({profileApiStatus: apiStatusConstants.failure})
    }
  }

  renderSearchBar = searchBarID => {
    const {searchInput} = this.state
    return (
      <div className="search-bar" id={searchBarID}>
        <input
          className="search-input"
          type="search"
          placeholder="Search"
          value={searchInput}
          onChange={e => this.setState({searchInput: e.target.value})}
        />
        <button
          aria-label="Save"
          className="search-button"
          type="button"
          data-testid="searchButton"
          onClick={() => this.getJobs()}
        >
          <BsSearch className="search-icon" />
        </button>
      </div>
    )
  }

  renderSideBar = () => {
    const {
      profileDetails,
      profileApiStatus,
      activeSalaryRangeId,
      employmentTypesChecked,
      locationsChecked,
    } = this.state
    return (
      <div className="side-bar">
        {this.renderSearchBar('smallSearchBar')}
        <ProfileDetails
          profileDetails={profileDetails}
          profileApiStatus={profileApiStatus}
          getProfileDetails={this.getProfileDetails}
        />
        <hr className="separator" />
        <FiltersGroup
          updateSalaryRangeId={this.updateSalaryRangeId}
          activeSalaryRangeId={activeSalaryRangeId}
          updateEmploymentTypesChecked={this.updateEmploymentTypesChecked}
          employmentTypesChecked={employmentTypesChecked}
          updateLocationsChecked={this.updateLocationsChecked}
          locationsChecked={locationsChecked}
        />
      </div>
    )
  }

  renderNoJobsView = () => (
    <div className="no-jobs-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
        alt="no jobs"
        className="no-jobs-image"
      />
      <h1 className="no-jobs-heading">No Jobs Found</h1>
      <p className="no-jobs-description">
        We could not find any jobs. Try other filters.
      </p>
    </div>
  )

  renderJobsList = () => {
    const {filteredJobsList} = this.state // Changed from jobsList to filteredJobsList
    return (
      <>
        {filteredJobsList.length > 0 ? (
          <ul className="jobs-list">
            {filteredJobsList.map(eachJob => (
              <JobCard key={eachJob.id} jobDetails={eachJob} />
            ))}
          </ul>
        ) : (
          this.renderNoJobsView()
        )}
      </>
    )
  }

  renderJobsLoaderView = () => (
    <div className="jobs-loader-container" data-testid="loader">
      <div>Loading...</div>
    </div>
  )

  renderJobsApiFailureView = () => (
    <div className="jobs-api-failure-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
        className="job-api-failure-image"
      />
      <h1 className="failure-view-heading">Oops! Something Went Wrong</h1>
      <p className="failure-view-description">
        We cannot seem to find the page you are looking for.
      </p>
      <button
        type="button"
        className="retry-button"
        onClick={() => this.getJobs()}
      >
        Retry
      </button>
    </div>
  )

  renderJobsBasedOnAPiStatus = () => {
    const {jobsApiStatus} = this.state

    switch (jobsApiStatus) {
      case apiStatusConstants.inProgress:
        return this.renderJobsLoaderView()
      case apiStatusConstants.success:
        return this.renderJobsList()
      case apiStatusConstants.failure:
        return this.renderJobsApiFailureView()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="jobs-page-container">
          <div className="jobs-page">
            {this.renderSideBar()}
            <div className="jobs-container">
              {this.renderSearchBar('largeSearchBar')}
              {this.renderJobsBasedOnAPiStatus()}
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default Jobs