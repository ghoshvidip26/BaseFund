// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

contract CrowdFund {
    struct Projects {
        address projectCreator;
        string imageURI;
        string title;
        string description;
        string[] contributors;
        uint[] contributionAmounts;
    }

    address private immutable owner;
    uint private nextId = 1;
    Projects[] public projects;
    bool private locked;

    modifier nonRenntrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    event ProjectCreated(
        uint indexed projectId,
        address projectCreator,
        string imageURI,
        string title,
        string description,
        string[] contributors
    );
    event ContributionMade(
        uint indexed projectId,
        string contributor,
        uint amount
    );
    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    function createProject(
        string memory imageURI,
        string memory title,
        string memory description,
        string[] memory contributors
    ) public {
        require(bytes(title).length > 0, "Title must not be empty");
        require(bytes(description).length > 0, "Description must not be empty");
        require(bytes(imageURI).length > 0, "Image URI must not be empty");
        uint currentId = nextId++;
        projects.push(
            Projects(
                msg.sender,
                imageURI,
                title,
                description,
                contributors,
                new uint[](0)
            )
        );
        emit ProjectCreated(
            currentId,
            msg.sender,
            imageURI,
            title,
            description,
            contributors
        );
    }

    function contribute(
        uint projectId,
        string memory contributorName
    ) public payable nonRenntrant {
        require(projectId < projects.length, "Project does not exist");
        require(msg.value > 0, "Contribution amount must be greater than zero");

        Projects storage project = projects[projectId];
        project.contributors.push(contributorName);
        project.contributionAmounts.push(msg.value);

        emit ContributionMade(projectId, contributorName, msg.value);
    }

    function getAllProjects() public view returns (Projects[] memory) {
        return projects;
    }

    function getProjectDetails(
        uint projectId
    )
        public
        view
        returns (
            uint id,
            address projectCreator,
            string memory title,
            string memory description,
            string memory imageURI,
            string[] memory contributors,
            uint[] memory contributionAmounts
        )
    {
        Projects storage project = projects[projectId];
        require(projectId < projects.length, "Project does not exist");
        return (
            project.id,
            project.projectCreator,
            project.title,
            project.description,
            project.imageURI,
            project.contributors,
            project.contributionAmounts
        );
    }

    function getProjectsCount() public view returns (uint256) {
        return projects.length;
    }
}
