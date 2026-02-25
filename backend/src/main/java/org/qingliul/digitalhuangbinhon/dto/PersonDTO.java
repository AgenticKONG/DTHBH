package org.qingliul.digitalhuangbinhon.dto;

/**
 * 人物信息 DTO（用于地点中的好友列表）
 */
public class PersonDTO {
    private String name;
    private String history;

    public PersonDTO() {
    }

    public PersonDTO(String name, String history) {
        this.name = name;
        this.history = history;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHistory() {
        return history;
    }

    public void setHistory(String history) {
        this.history = history;
    }

    public static PersonDTOBuilder builder() {
        return new PersonDTOBuilder();
    }

    public static class PersonDTOBuilder {
        private String name;
        private String history;

        PersonDTOBuilder() {
        }

        public PersonDTOBuilder name(String name) {
            this.name = name;
            return this;
        }

        public PersonDTOBuilder history(String history) {
            this.history = history;
            return this;
        }

        public PersonDTO build() {
            return new PersonDTO(this.name, this.history);
        }
    }
}

