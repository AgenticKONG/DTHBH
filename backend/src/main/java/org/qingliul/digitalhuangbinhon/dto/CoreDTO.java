package org.qingliul.digitalhuangbinhon.dto;

/**
 * 核心人物信息 DTO
 */
public class CoreDTO {
    private String id;
    private Integer birth;
    private Integer death;

    public CoreDTO() {
    }

    public CoreDTO(String id, Integer birth, Integer death) {
        this.id = id;
        this.birth = birth;
        this.death = death;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Integer getBirth() {
        return birth;
    }

    public void setBirth(Integer birth) {
        this.birth = birth;
    }

    public Integer getDeath() {
        return death;
    }

    public void setDeath(Integer death) {
        this.death = death;
    }

    public static CoreDTOBuilder builder() {
        return new CoreDTOBuilder();
    }

    public static class CoreDTOBuilder {
        private String id;
        private Integer birth;
        private Integer death;

        CoreDTOBuilder() {
        }

        public CoreDTOBuilder id(String id) {
            this.id = id;
            return this;
        }

        public CoreDTOBuilder birth(Integer birth) {
            this.birth = birth;
            return this;
        }

        public CoreDTOBuilder death(Integer death) {
            this.death = death;
            return this;
        }

        public CoreDTO build() {
            return new CoreDTO(this.id, this.birth, this.death);
        }
    }
}

