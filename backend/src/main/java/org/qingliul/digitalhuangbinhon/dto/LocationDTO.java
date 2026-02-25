package org.qingliul.digitalhuangbinhon.dto;

import java.util.List;

/**
 * 地点信息 DTO
 */
public class LocationDTO {
    private String id;
    private String year;
    private String info;
    private List<PersonDTO> people;
    private List<Double> coords; // [lng, lat]

    public LocationDTO() {
    }

    public LocationDTO(String id, String year, String info, List<PersonDTO> people, List<Double> coords) {
        this.id = id;
        this.year = year;
        this.info = info;
        this.people = people;
        this.coords = coords;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public String getInfo() {
        return info;
    }

    public void setInfo(String info) {
        this.info = info;
    }

    public List<PersonDTO> getPeople() {
        return people;
    }

    public void setPeople(List<PersonDTO> people) {
        this.people = people;
    }

    public List<Double> getCoords() {
        return coords;
    }

    public void setCoords(List<Double> coords) {
        this.coords = coords;
    }

    public static LocationDTOBuilder builder() {
        return new LocationDTOBuilder();
    }

    public static class LocationDTOBuilder {
        private String id;
        private String year;
        private String info;
        private List<PersonDTO> people;
        private List<Double> coords;

        LocationDTOBuilder() {
        }

        public LocationDTOBuilder id(String id) {
            this.id = id;
            return this;
        }

        public LocationDTOBuilder year(String year) {
            this.year = year;
            return this;
        }

        public LocationDTOBuilder info(String info) {
            this.info = info;
            return this;
        }

        public LocationDTOBuilder people(List<PersonDTO> people) {
            this.people = people;
            return this;
        }

        public LocationDTOBuilder coords(List<Double> coords) {
            this.coords = coords;
            return this;
        }

        public LocationDTO build() {
            return new LocationDTO(this.id, this.year, this.info, this.people, this.coords);
        }
    }
}

